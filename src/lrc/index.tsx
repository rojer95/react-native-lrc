/* eslint-disable react-native/no-inline-styles */
import React, { useRef, useImperativeHandle, useEffect } from 'react';
import { ScrollView, StyleProp, Text, View, ViewStyle } from 'react-native';

import { LrcLine, AUTO_SCROLL_AFTER_USER_SCROLL } from '../constant';
import useLrc from '../util/use_lrc';
import useCurrentIndex from './use_current_index';
import useLocalAutoScroll from './use_local_auto_scroll';

interface Props {
  /** lrc string */
  lrc: string;
  /** lrc line render */
  lineRenderer: ({
    lrcLine,
    index,
    active,
  }: {
    lrcLine: LrcLine;
    index: number;
    active: boolean;
  }) => React.ReactNode;
  /** audio currentTime, millisecond */
  currentTime?: number;
  /** whether auto scroll  */
  autoScroll?: boolean;
  /** auto scroll after user scroll */
  autoScrollAfterUserScroll?: number;
  /** when current line change */
  onCurrentLineChange?: ({
    index,
    lrcLine,
  }: {
    index: number;
    lrcLine: LrcLine | null;
  }) => void;
  style: StyleProp<ViewStyle>;
  height: number;
  lineHeight: number;
  activeLineHeight: number;
  [key: string]: any;
}

// eslint-disable-next-line no-spaced-func
const Lrc = React.forwardRef<
  {
    scrollToCurrentLine: () => void;
    getCurrentLine: () => {
      index: number;
      lrcLine: LrcLine | null;
    };
  },
  Props
>(function Lrc(
  {
    lrc,
    lineRenderer = ({ lrcLine: { content }, active }) => (
      <Text style={{ textAlign: 'center', color: active ? 'green' : '#666' }}>
        {content}
      </Text>
    ),
    currentTime = 0,
    autoScroll = true,
    lineHeight = 16,
    activeLineHeight = lineHeight,
    autoScrollAfterUserScroll = AUTO_SCROLL_AFTER_USER_SCROLL,
    onCurrentLineChange,
    height = 500,
    style,
    ...props
  }: Props,
  ref,
) {
  const lrcRef = useRef<ScrollView>(null);
  const lrcLineList = useLrc(lrc);

  const currentIndex = useCurrentIndex({ lrcLineList, currentTime });
  const { localAutoScroll, resetLocalAutoScroll, onScroll } =
    useLocalAutoScroll({
      autoScroll,
      autoScrollAfterUserScroll,
    });

  // auto scroll
  useEffect(() => {
    let isUnmount = false;
    if (localAutoScroll && !isUnmount) {
      lrcRef.current?.scrollTo({
        y: currentIndex * lineHeight || 0,
        animated: true,
      });
    }
    return () => {
      isUnmount = true;
    };
  }, [currentIndex, localAutoScroll, lineHeight]);

  // on current line change
  useEffect(() => {
    let isUnmount = false;
    if (onCurrentLineChange && !isUnmount) {
      onCurrentLineChange({
        index: currentIndex,
        lrcLine: lrcLineList[currentIndex] || null,
      });
    }
    return () => {
      isUnmount = true;
    };
  }, [lrcLineList, currentIndex, onCurrentLineChange]);

  useImperativeHandle(ref, () => ({
    getCurrentLine: () => ({
      index: currentIndex,
      lrcLine: lrcLineList[currentIndex] || null,
    }),
    scrollToCurrentLine: () => {
      resetLocalAutoScroll();
      lrcRef.current?.scrollTo({
        y: currentIndex * lineHeight || 0,
        animated: true,
      });
    },
  }));

  return (
    <ScrollView
      {...props}
      ref={lrcRef}
      scrollEventThrottle={40}
      onScroll={onScroll}
      style={[style, { height }]}>
      <View>
        {autoScroll ? (
          <View style={{ width: '100%', height: 0.45 * height }} />
        ) : null}
        {lrcLineList.map((lrcLine, index) => (
          <View
            key={lrcLine.id}
            style={{
              height: currentIndex === index ? activeLineHeight : lineHeight,
            }}>
            {lineRenderer({ lrcLine, index, active: currentIndex === index })}
          </View>
        ))}
        {autoScroll ? (
          <View style={{ width: '100%', height: 0.5 * height }} />
        ) : null}
      </View>
    </ScrollView>
  );
});

export default Lrc;
