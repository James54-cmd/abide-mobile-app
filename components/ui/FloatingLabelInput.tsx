import { colors } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import { forwardRef, useCallback, useEffect, useRef, useState, type MutableRefObject } from "react";
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from "react-native";

interface FloatingLabelInputProps extends Omit<TextInputProps, "style"> {
  label: string;
  style?: StyleProp<ViewStyle>;
  /** When true, show a red underline (field error). */
  error?: boolean;
  /** Shown below the field when set (typically when `error` is true). */
  errorMessage?: string;
  /** Adds an eye toggle; controls `secureTextEntry` internally. */
  passwordVisibilityToggle?: boolean;
}

export const FloatingLabelInput = forwardRef<TextInput, FloatingLabelInputProps>(
  function FloatingLabelInput(
    {
      label,
      value,
      onFocus,
      onBlur,
      style,
      multiline,
      error,
      errorMessage,
      passwordVisibilityToggle,
      ...props
    },
    ref
  ) {
    const [isFocused, setIsFocused] = useState(false);
    const [passwordVisible, setPasswordVisible] = useState(false);
    const animatedValue = useRef(new Animated.Value(value ? 1 : 0)).current;
    const lineWidth = useRef(new Animated.Value(0)).current;
    const inputRef = useRef<TextInput | null>(null);

    const { secureTextEntry: secureProp, ...textInputProps } = props;
    const secureTextEntry = passwordVisibilityToggle ? !passwordVisible : secureProp;

    const setInputRef = useCallback(
      (node: TextInput | null) => {
        inputRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) (ref as MutableRefObject<TextInput | null>).current = node;
      },
      [ref]
    );

    const hasValue = !!value;
    const isFloating = isFocused || hasValue;

    useEffect(() => {
      Animated.timing(animatedValue, {
        toValue: isFloating ? 1 : 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }, [isFloating]);

    useEffect(() => {
      Animated.timing(lineWidth, {
        toValue: isFocused ? 1 : 0,
        duration: 220,
        useNativeDriver: false,
      }).start();
    }, [isFocused]);

    const labelTop = animatedValue.interpolate({ inputRange: [0, 1], outputRange: [18, 0] });
    const labelFontSize = animatedValue.interpolate({ inputRange: [0, 1], outputRange: [15, 11] });
    const labelColor = animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [colors.muted, error ? colors.inputErrorBorder : isFocused ? colors.gold : colors.muted],
    });

    const underlineColor = error ? colors.inputErrorBorder : colors.gold;

    return (
      <TouchableWithoutFeedback onPress={() => inputRef.current?.focus()}>
        <View style={[styles.container, style]}>
          <Animated.View pointerEvents="none" style={[styles.labelWrap, { top: labelTop }]}>
            <Animated.Text style={[styles.label, { fontSize: labelFontSize, color: labelColor }]}>
              {label}
            </Animated.Text>
          </Animated.View>

          <View style={styles.inputRow}>
            <TextInput
              ref={setInputRef}
              value={value}
              multiline={multiline}
              style={[styles.input, !multiline && styles.inputSingleLine]}
              onFocus={(e) => {
                setIsFocused(true);
                onFocus?.(e);
              }}
              onBlur={(e) => {
                setIsFocused(false);
                onBlur?.(e);
              }}
              placeholderTextColor="transparent"
              selectionColor={colors.gold}
              secureTextEntry={secureTextEntry}
              {...textInputProps}
            />
            {passwordVisibilityToggle ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={passwordVisible ? "Hide password" : "Show password"}
                hitSlop={10}
                onPress={() => setPasswordVisible((v) => !v)}
                style={styles.toggleHit}
              >
                <Feather
                  name={passwordVisible ? "eye" : "eye-off"}
                  size={20}
                  color={error ? colors.inputErrorBorder : colors.muted}
                />
              </Pressable>
            ) : null}
          </View>

          <View style={styles.underlineWrap}>
            <View
              style={[
                styles.underlineBase,
                { backgroundColor: error ? colors.inputErrorBorder : "rgba(140,123,106,0.25)" },
              ]}
            />
            <Animated.View
              style={[
                styles.underlineActive,
                {
                  backgroundColor: underlineColor,
                  width: lineWidth.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] }),
                },
              ]}
            />
          </View>

          {errorMessage ? (
            <Text style={styles.errorLabel} accessibilityLiveRegion="polite">
              {errorMessage}
            </Text>
          ) : null}
        </View>
      </TouchableWithoutFeedback>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    paddingTop: 16,
    paddingBottom: 0,
    position: "relative",
    justifyContent: "flex-end",
  },
  labelWrap: {
    position: "absolute",
    left: 0,
    zIndex: 1,
  },
  label: {
    fontFamily: "sans",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
    color: colors.ink,
    padding: 0,
    paddingVertical: 0,
    margin: 0,
    fontFamily: "sans",
    ...Platform.select({ android: { textAlignVertical: "center" as const } }),
  },
  inputSingleLine: {
    height: 24,
  },
  toggleHit: {
    paddingLeft: 8,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  underlineWrap: {
    position: "relative",
    width: "100%",
  },
  underlineBase: {
    height: 1,
    width: "100%",
  },
  underlineActive: {
    height: 1.5,
    position: "absolute",
    bottom: 0,
    left: 0,
  },
  errorLabel: {
    marginTop: 6,
    fontSize: 12,
    lineHeight: 16,
    fontFamily: "sans",
    color: colors.inputErrorBorder,
  },
});
