import React from 'react';
import OptimizedImage from "../../../components/Common/OptimizedImage";
import { CloseIcon, ChevronRightIcon } from "../../../components/Icons";

const ImageGalleryModal = ({ modalState, onClose, onNext, onPrev }) => {
    if (!modalState.show) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 backdrop-blur-md" onClick={onClose}>
            <button
                onClick={onClose}
                className="absolute top-6 right-6 z-20 w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
            >
                <CloseIcon className="w-6 h-6" />
            </button>

            {modalState.images.length > 1 && (
                <>
                    <button
                        onClick={(e) => { e.stopPropagation(); onPrev(); }}
                        className="absolute left-4 z-20 w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                    >
                        <ChevronRightIcon className="w-8 h-8 rotate-180" />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onNext(); }}
                        className="absolute right-4 z-20 w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                    >
                        <ChevronRightIcon className="w-8 h-8" />
                    </button>
                </>
            )}

            <div className="relative max-w-4xl max-h-[85vh] w-full h-full flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
                <OptimizedImage
                    src={modalState.images[modalState.currentIndex]}
                    alt={`Package ${modalState.currentIndex + 1}`}
                    className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                />
                {modalState.images.length > 1 && (
                    <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-white/20 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-sm font-medium border border-white/10">
                        {modalState.currentIndex + 1} / {modalState.images.length}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ImageGalleryModal;
