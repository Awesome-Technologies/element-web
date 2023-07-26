/*
Copyright 2023 Awesome Technologies Innovationslabor GmbH

All rights reserved
*/

import React, { useState, useRef, useEffect } from "react";
import "./DropdownItem.css";

interface IProps {
    onClick: Function;
    text: string;
    isChecked?: boolean;
}

const DropdownItem: React.FC<IProps> = ({ onClick, text, isChecked: isCheckedProp = false }) => {
    const [isChecked, setIsChecked] = useState<boolean>(isCheckedProp);
    const animationRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        setIsChecked(isCheckedProp);
    }, [isCheckedProp]);

    const handleClick = (): void => {
        onClick();
        if (animationRef.current) {
            const element = animationRef.current;
            element.classList.remove("aw_dropdownItem--active");
            void element.offsetWidth; // This line triggers a reflow to restart the checkmark animation immediately on click
            element.classList.add("aw_dropdownItem--active");
        }
    };

    return (
        <button className="aw_dropdownItem mx_Dialog_nonDialogButton" onClick={handleClick} ref={animationRef}>
            {isChecked ? (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="16" height="16" rx="4" fill="#008B9D" />
                    <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M12.4716 4.86121C12.5966 4.98623 12.6668 5.15576 12.6668 5.33254C12.6668 5.50932 12.5966 5.67885 12.4716 5.80387L7.13827 11.1372C7.01325 11.2622 6.84371 11.3324 6.66694 11.3324C6.49016 11.3324 6.32062 11.2622 6.19561 11.1372L3.52894 8.47054C3.4075 8.34481 3.3403 8.1764 3.34182 8.00161C3.34334 7.82681 3.41345 7.6596 3.53706 7.53599C3.66066 7.41239 3.82787 7.34228 4.00267 7.34076C4.17747 7.33924 4.34587 7.40643 4.4716 7.52787L6.66694 9.72321L11.5289 4.86121C11.654 4.73623 11.8235 4.66602 12.0003 4.66602C12.177 4.66602 12.3466 4.73623 12.4716 4.86121Z"
                        fill="white"
                    />
                </svg>
            ) : (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="1" y="1" width="14" height="14" rx="3.5" stroke="#E0E2E7" strokeWidth="2" />
                </svg>
            )}
            {text}
        </button>
    );
};

export default DropdownItem;
