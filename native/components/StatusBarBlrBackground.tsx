/**
 * Copyright 2021 Marc Rousavy
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files 
 * (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, 
 * publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, 
 * subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES 
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE 
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN 
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE. 
*/

import { BlurView, BlurViewProps } from '@react-native-community/blur';
import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import StaticSafeAreaInsets from 'react-native-static-safe-area-insets';

const FALLBACK_COLOR = 'rgba(140, 140, 140, 0.3)';

const StatusBarBlurBackgroundImpl = ({ style, ...props }: BlurViewProps): React.ReactElement | null => {
  if (Platform.OS !== 'ios') return null;

  return (
    <BlurView
      style={[styles.statusBarBackground, style]}
      blurAmount={25}
      blurType="light"
      reducedTransparencyFallbackColor={FALLBACK_COLOR}
      {...props}
    />
  );
};

export const StatusBarBlurBackground = React.memo(StatusBarBlurBackgroundImpl);

const styles = StyleSheet.create({
  statusBarBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: StaticSafeAreaInsets.safeAreaInsetsTop,
  },
});