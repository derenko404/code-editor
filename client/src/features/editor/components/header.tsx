import Select, { OptionProps, ValueContainerProps } from "react-select";

import "./header.scss";

import play from "../../../assets/icons/play.svg";
import stop from "../../../assets/icons/stop.svg";
import { Language } from "../types";

export type SelectOption = {
  value: Language;
  icon: string;
  label: string;
};

const Option = (props: OptionProps<SelectOption>) => {
  const {
    children,
    className,
    cx,
    getStyles,
    isDisabled,
    isFocused,
    isSelected,
    innerRef,
    innerProps,
  } = props;
  return (
    <div
      ref={innerRef}
      // @ts-ignore
      style={{
        ...getStyles("option", props),
        display: "flex",
        alignItems: "center",
        gap: "10px",
      }}
      className={cx(
        {
          option: true,
          "option--is-disabled": isDisabled,
          "option--is-focused": isFocused,
          "option--is-selected": isSelected,
        },
        className,
      )}
      {...innerProps}
    >
      <img src={props.data.icon} /> {children}
    </div>
  );
};

const ValueContainer = (
  props: ValueContainerProps<SelectOption> & {
    selectedValue: string;
    rawOptions: SelectOption[];
  },
) => {
  const selected = props.rawOptions.find(
    (o) => o.value === props.selectedValue,
  );

  const { children, className, cx, getStyles, isDisabled, innerProps } = props;

  return (
    <div
      // @ts-ignore
      style={{
        ...getStyles("valueContainer", props),
        display: "flex",
        alignItems: "center",
        gap: "10px",
        caretColor: "transparent",
      }}
      className={cx(
        {
          option: true,
          "option--is-disabled": isDisabled,
        },
        className,
      )}
      {...innerProps}
    >
      <img src={selected?.icon} />
      {children}
    </div>
  );
};

type Props = {
  onChangeLanguage: (option: SelectOption) => void;
  onClickPlay: () => void;
  onClickStop: () => void;
  options: SelectOption[];
  isDisabled: boolean;
  language: string;
};

export const Header: React.FC<Props> = (props) => {
  return (
    <div className="header">
      <Select
        // @ts-ignore
        onChange={props.onChangeLanguage}
        options={props.options}
        placeholder="Select Language"
        defaultValue={
          props.options.find((o) => o.value === props.language) ??
          props.options[0]
        }
        className="select"
        isDisabled={props.isDisabled}
        components={{
          Option,
          ValueContainer: (p) => (
            <ValueContainer
              {...p}
              rawOptions={props.options}
              selectedValue={props.language}
            />
          ),
        }}
        theme={(theme) => ({
          ...theme,
          borderRadius: 0,
          colors: {
            ...theme.colors,
            primary25: "rgb(153, 153, 153)",
            primary: "#252525",
          },
        })}
      />
      <div className="header-buttons">
        <button
          className="play-button"
          onClick={props.onClickPlay}
          disabled={props.isDisabled}
        >
          RUN <img src={play} />
        </button>
        <button
          className="stop-button"
          onClick={props.onClickStop}
          disabled={!props.isDisabled}
        >
          STOP <img src={stop} />
        </button>
      </div>
    </div>
  );
};
