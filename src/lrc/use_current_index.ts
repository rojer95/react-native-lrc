import { useState, useEffect } from 'react';

import { LrcLine } from '../constant';

export default ({
  lrcLineList,
  currentTime,
}: {
  lrcLineList: LrcLine[];
  currentTime: number;
}) => {
  const [currentIndex, setCurrentIndex] = useState(-1);

  useEffect(() => {
    let isUnmount = false;
    if (!isUnmount) {
      const { length } = lrcLineList;
      let i = 0;
      for (; i < length; i += 1) {
        const { millisecond } = lrcLineList[i];
        if (currentTime < millisecond) {
          break;
        }
      }
      setCurrentIndex(i - 1);
    }
    return () => {
      isUnmount = true;
    };
  }, [currentTime, lrcLineList]);

  return currentIndex;
};
