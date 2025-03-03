/**
 * Dropdown terms component.
 */
import React, { useState, useRef, useEffect } from "react";
import PT from "prop-types";
import _ from "lodash";
import { Creatable } from "react-select";
import iconDown from "assets/icons/dropdown-arrow.png";
import config from "../../../config";
import "./styles.scss";

function DropdownTerms({
  terms,
  placeholder,
  label,
  required,
  onChange,
  errorMsg,
  addNewOptionPlaceholder,
  size,
}) {
  const [internalTerms, setInternalTerms] = useState(terms);
  const selectedOption = _.filter(internalTerms, { selected: true }).map(
    (o) => ({
      value: o.label,
      label: o.label,
    })
  );
  const [focused, setFocused] = useState(false);
  const delayedOnChange = useRef(
    _.debounce((q, cb) => cb(q), config.GUIKIT.DEBOUNCE_ON_CHANGE_TIME) // eslint-disable-line no-undef
  ).current;

  const containerRef = useRef(null);
  let inputFieldRef = useRef(null);
  const latestPropsRef = useRef(null);
  latestPropsRef.current = { addNewOptionPlaceholder };

  useEffect(() => {
    const selectInput = containerRef.current.getElementsByClassName(
      "Select-input"
    );
    if (selectInput && selectInput.length) {
      inputFieldRef.current = selectInput[0].getElementsByTagName("input");
      inputFieldRef.current[0].placeholder = focused
        ? latestPropsRef.current.addNewOptionPlaceholder
        : "";
      inputFieldRef.current[0].style.border = "none";
      inputFieldRef.current[0].style.boxShadow = "none";
      selectInput[0].style.borderTop = "none";
    }
  }, [focused, selectedOption]);
  useEffect(() => {
    setInternalTerms(terms); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [terms && terms.length]);

  const CustomReactSelectRow = React.forwardRef(
    ({ className, option, children, onSelect }, ref) =>
      children ? (
        <span
          ref={ref}
          role="button"
          className={className}
          onMouseDown={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onSelect(option, event);
          }}
          title={option.title}
          tabIndex={-1}
        >
          {children}
        </span>
      ) : null
  );

  CustomReactSelectRow.defaultProps = {
    children: null,
    className: "",
    onSelect: () => {},
  };

  CustomReactSelectRow.propTypes = {
    children: PT.node,
    className: PT.string,
    onSelect: PT.func,
    option: PT.object.isRequired,
  };

  return (
    <div
      ref={containerRef}
      className="dropdownContainer"
      styleName={`container ${
        selectedOption && !!selectedOption.length ? "haveValue" : ""
      } ${errorMsg ? "haveError" : ""} ${
        _.every(internalTerms, { selected: true }) ? "isEmptySelectList" : ""
      } ${focused ? "isFocused" : ""} ${
        size === "lg" ? "term-lgSize" : "term-xsSize"
      }`}
    >
      <div styleName="relative">
        <Creatable
          onOpen={() => setFocused(true)}
          onClose={() => setFocused(false)}
          autosize={false}
          optionComponent={CustomReactSelectRow}
          options={internalTerms.map((o) => ({
            value: o.label,
            label: o.label,
          }))}
          value={selectedOption}
          onInputKeyDown={(e) => {
            switch (e.keyCode) {
              case 13: // ENTER
                if (inputFieldRef.current && inputFieldRef.current[0]) {
                  const { value } = inputFieldRef.current[0];
                  if (
                    !value ||
                    !value.trim() ||
                    _.find(selectedOption, { label: value }) ||
                    _.find(internalTerms, { label: value })
                  ) {
                    e.preventDefault();
                  }
                }
                break;
              default:
            }
          }}
          onChange={(value) => {
            const newValues = _.filter(
              value,
              (o) =>
                o.label &&
                o.label.trim() &&
                !_.find(internalTerms, { label: o.label })
            ).map((o) => ({ selected: true, label: o.label }));
            const newTerms = internalTerms
              .map((o) => ({
                selected: !!_.find(value, { label: o.label }),
                label: o.label,
              }))
              .concat(newValues);
            setInternalTerms(newTerms);
            delayedOnChange(_.cloneDeep(newTerms), onChange);
          }}
          placeholder={
            focused
              ? ""
              : `${placeholder}${placeholder && required ? " *" : ""}`
          }
          clearable={true}
          backspaceRemoves={false}
          multi
          promptTextCreator={() => null}
          filterOptions={(option, inputValue) =>
            _.filter(internalTerms, (t) =>
              inputValue && inputValue.length >= 1
                ? t.label.toLowerCase().includes(inputValue.toLowerCase()) &&
                  !_.find(selectedOption, { label: t.label })
                : !_.find(selectedOption, { label: t.label })
            )
          }
        />
        <img
          width="15"
          height="9"
          styleName="iconDropdown"
          src={iconDown}
          alt="dropdown-arrow-icon"
        />
      </div>
      {label ? (
        <span styleName="label" className="dropdownLabel">
          {label}
          {required ? <span>&nbsp;*</span> : null}
        </span>
      ) : null}
      {errorMsg ? <span styleName="errorMessage">{errorMsg}</span> : null}
    </div>
  );
}

DropdownTerms.defaultProps = {
  placeholder: "",
  label: "",
  required: false,
  onChange: () => {},
  errorMsg: "",
  addNewOptionPlaceholder: "",
  size: "lg",
};

DropdownTerms.propTypes = {
  terms: PT.arrayOf(
    PT.shape({
      label: PT.string.isRequired,
      selected: PT.bool.isRequired,
    })
  ).isRequired,
  placeholder: PT.string,
  label: PT.string,
  required: PT.bool,
  onChange: PT.func,
  errorMsg: PT.string,
  addNewOptionPlaceholder: PT.string,
  size: PT.oneOf(["xs", "lg"]),
};

export default DropdownTerms;
