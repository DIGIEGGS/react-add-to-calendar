import React, { useState, useEffect, useCallback, ReactElement } from "react";

// helpers
import { isMobile, getRandomKey, buildUrl } from "../../helpers";

// types
import { IEvent } from "../../types";

// styles
import "./AddToCalendar.css";

interface IOptions {
  optionsOpen?: boolean;
  listItems?: object[];
  displayItemIcons?: boolean;
  event: IEvent;
  dropdownClass?: string;
  buttonLabel?: string | ReactElement;
  buttonTemplate?: object;
  buttonIconClass?: string;
  useFontAwesomeIcons?: boolean;
  buttonClassClosed?: string;
  buttonClassOpen?: string;
  buttonWrapperClass?: string;
  rootClass?: string;
}

const defaultValues = {
  buttonClassClosed: "react-add-to-calendar__button",
  buttonClassOpen: "react-add-to-calendar__button--light",
  buttonLabel: "Add to My Calendar",
  buttonTemplate: { caret: "right" },
  buttonIconClass: "react-add-to-calendar__icon--",
  useFontAwesomeIcons: true,
  buttonWrapperClass: "react-add-to-calendar__wrapper",
  displayItemIcons: true,
  optionsOpen: false,
  dropdownClass: "react-add-to-calendar__dropdown",
  // event: {
  //   title: "Sample Event",
  //   description: "This is the sample event provided as an example only",
  //   location: "Portland, OR",
  //   startTime: "2016-09-16T20:15:00-04:00",
  //   endTime: "2016-09-16T21:45:00-04:00"
  // },
  listItems: [
    { apple: "Apple Calendar" },
    { google: "Google" },
    { outlook: "Outlook" },
    { outlookcom: "Outlook.com" },
    { yahoo: "Yahoo" }
  ],
  rootClass: "react-add-to-calendar"
};

const AddToCalendar: React.FC<IOptions> = ({
  optionsOpen = defaultValues.optionsOpen,
  listItems = defaultValues.listItems,
  displayItemIcons = defaultValues.displayItemIcons,
  event,
  dropdownClass = defaultValues.dropdownClass,
  buttonLabel = defaultValues.buttonLabel,
  buttonTemplate = defaultValues.buttonTemplate,
  buttonIconClass = defaultValues.buttonIconClass,
  buttonClassClosed = defaultValues.buttonClassClosed,
  buttonClassOpen = defaultValues.buttonClassOpen,
  buttonWrapperClass = defaultValues.buttonWrapperClass,
  rootClass = defaultValues.rootClass,
  useFontAwesomeIcons = defaultValues.useFontAwesomeIcons
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
    setOptionsOpenState(!optionsOpenState);
  }, [optionsOpenState]);

  useEffect(() => {
    if (optionsOpenState) {
      window.document.addEventListener("click", toggleCalendarDropdown, false);
    }

    return () => {
      window.document.removeEventListener("click", toggleCalendarDropdown);
    };
  }, [optionsOpenState, toggleCalendarDropdown]);

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
        const currentIcon =
          currentItem === "outlook" || currentItem === "outlookcom"
            ? "windows"
            : currentItem;
        icon = <i className={"fa fa-" + currentIcon} />;
      }

      return (
        <li key={getRandomKey()}>
          <a
            className={currentItem + "-link"}
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
    displayItemIcons,
    event,
    isCrappyIE,
    dropdownClass,
    listItems,
    handleDropdownLinkClick
  ]);

  const renderButton = useCallback(() => {
    let button_label = buttonLabel;
    let buttonIcon = null;
    const template = Object.keys(buttonTemplate);

    if (template[0] !== "textOnly") {
      const iconPlacement =
        buttonTemplate[template[0] as keyof typeof buttonTemplate];
      const buttonClassPrefix =
        buttonIconClass === "react-add-to-calendar__icon--"
          ? `${buttonIconClass}${iconPlacement}`
          : buttonIconClass;
      const iconPrefix = useFontAwesomeIcons ? "fa fa-" : "";

      const mainButtonIconClass =
        template[0] === "caret"
          ? optionsOpenState
            ? "caret-up"
            : "caret-down"
          : template[0];

      const button_IconClass = `${buttonClassPrefix} ${iconPrefix}${mainButtonIconClass}`;

      buttonIcon = <i className={button_IconClass} />;
      button_label =
        iconPlacement === "right" ? (
          <span>
            {button_label + " "}
            {buttonIcon}
          </span>
        ) : (
          <span>
            {buttonIcon}
            {" " + button_label}
          </span>
        );
    }

    const buttonClass = optionsOpenState
      ? buttonClassClosed + " " + buttonClassOpen
      : buttonClassClosed;

    return (
      <div className={buttonWrapperClass}>
        <a className={buttonClass} onClick={toggleCalendarDropdown}>
          {button_label}
        </a>
      </div>
    );
  }, [
    optionsOpenState,
    toggleCalendarDropdown,
    buttonClassClosed,
    buttonClassOpen,
    buttonIconClass,
    buttonLabel,
    buttonTemplate,
    buttonWrapperClass,
    useFontAwesomeIcons
  ]);

  return (
    <div className={rootClass}>
      {event && renderButton()}
      {optionsOpenState && renderDropdown()}
    </div>
  );
};

export default AddToCalendar;
