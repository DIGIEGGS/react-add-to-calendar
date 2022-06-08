import React, { useState, useEffect, useCallback, ReactElement } from "react";

// helpers
import { isMobile, getRandomKey, buildUrl } from "../../helpers";

// types
import { IAddToCalendarEvent } from "../../types";

// styles
import "./AddToCalendar.css";

// svg
import apple from "../../assets/img/apple.svg";
import google from "../../assets/img/google.svg";
import outlook from "../../assets/img/outlook.svg";
import yahoo from "../../assets/img/yahoo.svg";

interface IOptions {
  optionsOpen?: boolean;
  listItems?: object[];
  displayItemIcons?: boolean;
  event: IAddToCalendarEvent;
  dropdownClass?: string;
  buttonLabel?: string | ReactElement;
  buttonClassClosed?: string;
  buttonClassOpen?: string;
  buttonWrapperClass?: string;
  rootClass?: string;
  svgList?: {
    apple: any;
    google: any;
    outlook: any;
    yahoo: any;
    outlookcom: any;
  };
}

const defaultValues = {
  buttonClassClosed: "react-add-to-calendar__button",
  buttonClassOpen: "react-add-to-calendar__button--light",
  buttonLabel: "Add to My Calendar",
  buttonWrapperClass: "react-add-to-calendar__wrapper",
  displayItemIcons: true,
  optionsOpen: false,
  dropdownClass: "react-add-to-calendar__dropdown",
  listItems: [
    { apple: "Apple Calendar" },
    { google: "Google" },
    { outlook: "Outlook" },
    { outlookcom: "Outlook.com" },
    { yahoo: "Yahoo" }
  ],
  rootClass: "react-add-to-calendar"
};

const svgMap = {
  apple: apple,
  google: google,
  outlook: outlook,
  yahoo: yahoo
};

const AddToCalendar: React.FC<IOptions> = ({
  optionsOpen = defaultValues.optionsOpen,
  listItems = defaultValues.listItems,
  displayItemIcons = defaultValues.displayItemIcons,
  event,
  dropdownClass = defaultValues.dropdownClass,
  buttonLabel = defaultValues.buttonLabel,
  buttonClassClosed = defaultValues.buttonClassClosed,
  buttonClassOpen = defaultValues.buttonClassOpen,
  buttonWrapperClass = defaultValues.buttonWrapperClass,
  rootClass = defaultValues.rootClass,
  svgList = svgMap
}) => {
  const [optionsOpenState, setOptionsOpenState] = useState<boolean>(
    optionsOpen || false
  );
  const [isCrappyIE, setIsCrappyIE] = useState<boolean>(false);

  useEffect(() => {
    // polyfill for startsWith to fix IE bug
    if (!String.prototype.startsWith) {
      String.prototype.startsWith = function (searchString, position) {
        position = position || 0;
        return this.indexOf(searchString, position) === position;
      };
    }

    let isCrappyIE = false;
    if (
      typeof window !== "undefined" &&
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window.navigator as any).msSaveOrOpenBlob &&
      window.Blob
    ) {
      isCrappyIE = true;
    }

    setIsCrappyIE(isCrappyIE);
  }, []);

  const toggleCalendarDropdown = useCallback(() => {
    setOptionsOpenState(prev => !prev);
  }, []);

  const handleDropdownLinkClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
      e.preventDefault();

      const url = e.currentTarget.getAttribute("href");

      if (
        !isMobile() &&
        (url?.startsWith("data") || url?.startsWith("BEGIN"))
      ) {
        const filename = "download.ics";
        const blob = new Blob([url], {
          type: "text/calendar;charset=utf-8"
        });

        if (isCrappyIE) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (window.navigator as any).msSaveOrOpenBlob(blob, filename);
        } else {
          /****************************************************************
        // many browsers do not properly support downloading data URIs
        // (even with "download" attribute in use) so this solution
        // ensures the event will download cross-browser
        ****************************************************************/
          const link = window.document.createElement("a");
          link.href = window.URL.createObjectURL(blob);
          link.setAttribute("download", filename);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      } else {
        url && window.open(url, "_blank");
      }

      toggleCalendarDropdown();
    },
    [isCrappyIE, toggleCalendarDropdown]
  );

  const renderDropdown = useCallback(() => {
    const items = listItems.map(listItem => {
      const currentItem = Object.keys(listItem)[0];
      const currentLabel = listItem[currentItem as keyof typeof listItem];

      let icon = null;
      if (displayItemIcons) {
        const currentIcon = svgList[currentItem as keyof typeof listItem];
        icon = <img src={currentIcon} />;
      }

      return (
        <li key={getRandomKey()}>
          <a
            onClick={handleDropdownLinkClick}
            href={buildUrl(event, currentItem, isCrappyIE)}
            target="_blank"
            rel="noopener noreferrer"
          >
            {icon}
            {currentLabel}
          </a>
        </li>
      );
    });

    return (
      <div className={dropdownClass}>
        <ul>{items}</ul>
      </div>
    );
  }, [
    listItems,
    dropdownClass,
    displayItemIcons,
    handleDropdownLinkClick,
    event,
    isCrappyIE,
    svgList
  ]);

  const renderButton = useCallback(() => {
    const buttonClass = optionsOpenState
      ? buttonClassClosed + " " + buttonClassOpen
      : buttonClassClosed;

    return (
      <div className={buttonWrapperClass}>
        <a className={buttonClass} onClick={toggleCalendarDropdown}>
          {buttonLabel}
        </a>
      </div>
    );
  }, [
    optionsOpenState,
    toggleCalendarDropdown,
    buttonClassClosed,
    buttonClassOpen,
    buttonLabel,
    buttonWrapperClass
  ]);

  return (
    <div className={rootClass}>
      {event && renderButton()}
      {optionsOpenState && renderDropdown()}
    </div>
  );
};

export default AddToCalendar;
