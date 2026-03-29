import { brandLogo, brandLogoSymbol } from "@/constants/brand";
import { Image, type ImageProps, type ImageStyle, type StyleProp } from "react-native";

type BrandLogoProps = Omit<ImageProps, "source"> & {
  variant?: "full" | "symbol";
  style?: StyleProp<ImageStyle>;
};

/**
 * Renders the app wordmark or symbol from `assets/brand/`.
 */
export function BrandLogo({ variant = "full", style, resizeMode = "contain", ...rest }: BrandLogoProps) {
  const source = variant === "symbol" ? brandLogoSymbol : brandLogo;
  return <Image source={source} resizeMode={resizeMode} style={style} accessibilityRole="image" {...rest} />;
}
