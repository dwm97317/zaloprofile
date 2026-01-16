import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from "react-i18next";

const AddressAutocomplete = ({
  onAddressSelect,
  placeholder,
  initialValue = "",
  className = ""
}) => {
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState(initialValue);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [useNewAPI, setUseNewAPI] = useState(false);

  const autocompleteService = useRef(null);
  const placesService = useRef(null);
  const debounceTimer = useRef(null);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const containerRef = useRef(null);

  // Initialize Google Services - Support both old and new API
  useEffect(() => {
    if (window.google && window.google.maps && window.google.maps.places) {
      // Check if new API is available
      if (window.google.maps.places.AutocompleteSuggestion) {
        console.log('✅ Using new Google Places API (AutocompleteSuggestion)');
        setUseNewAPI(true);
      } else {
        console.log('⚠️ Using legacy Google Places API (AutocompleteService)');
        autocompleteService.current = new window.google.maps.places.AutocompleteService();
        // PlacesService requires a DOM element (even if hidden)
        const dummyDiv = document.createElement("div");
        placesService.current = new window.google.maps.places.PlacesService(dummyDiv);
      }
    }
  }, []);

  // Sync initial value
  useEffect(() => {
    if (initialValue) setInputValue(initialValue);
  }, [initialValue]);

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchAddresses = async (query) => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoading(true);

    try {
      if (useNewAPI) {
        // New API: AutocompleteSuggestion
        const request = {
          input: query,
          includedRegionCodes: ["th"] // Restrict to Thailand
          // Note: languageCode is not supported in the new API
          // Language is set via the API script URL parameter
        };

        const { suggestions: newSuggestions } = await window.google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions(request);
        
        console.log('🔍 New API Response:', newSuggestions);
        
        if (newSuggestions && newSuggestions.length > 0) {
          // Convert new API format to compatible format
          const formattedSuggestions = newSuggestions.map(suggestion => {
            // Safe access with fallbacks
            const placePrediction = suggestion.placePrediction || {};
            const text = placePrediction.text || {};
            const structuredFormat = placePrediction.structuredFormat || {};
            const mainText = structuredFormat.mainText || {};
            const secondaryText = structuredFormat.secondaryText || {};
            
            return {
              place_id: placePrediction.placeId || '',
              description: text.text || '',
              structured_formatting: {
                main_text: mainText.text || text.text || '',
                secondary_text: secondaryText.text || ''
              }
            };
          });
          setSuggestions(formattedSuggestions);
          setShowSuggestions(true);
        } else {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      } else {
        // Legacy API: AutocompleteService
        if (!autocompleteService.current) {
          console.warn("Google Maps Autocomplete Service not loaded yet");
          return;
        }

        const request = {
          input: query,
          componentRestrictions: { country: "th" },
          fields: ["place_id", "description", "structured_formatting"]
        };

        autocompleteService.current.getPlacePredictions(request, (predictions, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
            setSuggestions(predictions);
            setShowSuggestions(true);
          } else {
            setSuggestions([]);
            setShowSuggestions(false);
          }
        });
      }
    } catch (error) {
      console.error('Address search error:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputValue(val);

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => searchAddresses(val), 300);
  };

  const handleSelect = async (place) => {
    setInputValue(place.description);
    setShowSuggestions(false);

    try {
      if (useNewAPI) {
        // New API: Place.fetchFields
        const placeInstance = new window.google.maps.places.Place({
          id: place.place_id
        });

        await placeInstance.fetchFields({
          fields: ["displayName", "formattedAddress", "addressComponents", "location"]
        });

        // Parse address components
        const components = placeInstance.addressComponents || [];
        const getComponent = (type) => {
          const component = components.find(c => c.types.includes(type));
          return component?.longText || "";
        };

        const parsed = {
          formatted_address: placeInstance.formattedAddress,
          description: place.description,
          detail: placeInstance.displayName || placeInstance.formattedAddress,
          // Thai Mapping
          province: getComponent("administrative_area_level_1"),
          city: getComponent("administrative_area_level_2"), // Amphoe
          sub_district: getComponent("sublocality_level_1") || getComponent("sublocality"), // Tambon
          postal_code: getComponent("postal_code"),
          coordinates: {
            lat: placeInstance.location?.lat(),
            lng: placeInstance.location?.lng()
          }
        };

        if (onAddressSelect) onAddressSelect(parsed);
      } else {
        // Legacy API: PlacesService.getDetails
        if (!placesService.current) return;

        const request = {
          placeId: place.place_id,
          fields: ["name", "formatted_address", "address_components", "geometry"]
        };

        placesService.current.getDetails(request, (placeResult, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && placeResult) {
            // Parse components
            const components = placeResult.address_components || [];
            const getComponent = (type) => components.find(c => c.types.includes(type))?.long_name || "";

            const parsed = {
              formatted_address: placeResult.formatted_address,
              description: place.description,
              detail: placeResult.name || placeResult.formatted_address,
              // Thai Mapping
              province: getComponent("administrative_area_level_1"),
              city: getComponent("administrative_area_level_2"), // Amphoe
              sub_district: getComponent("sublocality_level_1") || getComponent("sublocality"), // Tambon
              postal_code: getComponent("postal_code"),
              coordinates: {
                lat: placeResult.geometry?.location?.lat(),
                lng: placeResult.geometry?.location?.lng()
              }
            };

            if (onAddressSelect) onAddressSelect(parsed);
          }
        });
      }
    } catch (error) {
      console.error('Place details error:', error);
    }
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-blue-500 rounded-xl px-4 py-3 outline-none transition-all placeholder-gray-400"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder || t("address.placeholder.detail_search")}
          onFocus={() => inputValue.length > 1 && setShowSuggestions(true)}
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent"></div>
          </div>
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-[100] left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 max-h-60 overflow-y-auto">
          {suggestions.map((item, idx) => (
            <div
              key={item.place_id}
              onClick={() => handleSelect(item)}
              className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0"
            >
              <div className="font-medium text-gray-800 text-sm truncate">
                {item.structured_formatting.main_text}
              </div>
              <div className="text-xs text-gray-500 truncate">
                {item.structured_formatting.secondary_text}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AddressAutocomplete;
