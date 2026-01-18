import React, { useState, useEffect } from "react";
import classNames from "classnames";

const Banner = ({ course }) => {
    const [currentBanner, setCurrentBanner] = useState(0);

    // 轮播自动切换
    useEffect(() => {
        if (course.length > 1) {
            const timer = setInterval(() => {
                setCurrentBanner((prev) => (prev + 1) % course.length);
            }, 5000);
            return () => clearInterval(timer);
        }
    }, [course]);

    return (
        <div className="relative h-56 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 overflow-hidden">
            {/* 装饰性背景图案 */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-10 right-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
                <div className="absolute bottom-10 left-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
            </div>

            {/* 轮播图 */}
            {course.length > 0 && (
                <div className="flex overflow-x-auto snap-x h-full hide-scrollbar">
                    {course.map((item, index) => (
                        <img
                            key={index}
                            src={item["image"]["file_path"]}
                            className="w-full h-full object-cover snap-center shrink-0"
                            alt="banner"
                        />
                    ))}
                </div>
            )}

            {/* 指示器 */}
            {course.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {course.map((_, idx) => (
                        <div
                            key={idx}
                            className={classNames("h-2 rounded-full transition-all", {
                                "w-8 bg-white": idx === currentBanner,
                                "w-2 bg-white/50": idx !== currentBanner,
                            })}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Banner;
