import { useState, useCallback, useEffect, useRef } from 'react';

import useThrottle from '../util/use_throttle';
import useDebounce from '../util/use_debounce';

export default ({
  autoScroll,
  autoScrollAfterUserScroll,
}: {
  autoScroll: boolean;
  autoScrollAfterUserScroll: number;
}) => {

  const isUnmount = useRef(false)

  useEffect(()=>{
    isUnmount.current = false;
    return ()=>{
      isUnmount.current = true;
    }
  }, [])
  const [localAutoScroll, setLocalAutoScroll] = useState(autoScroll);
  const resetLocalAutoScroll = useCallback(
    () => {
      if (!isUnmount.current) {
        setLocalAutoScroll(autoScroll)
      }
    },
    [autoScroll],
  );

  const resetAutoScrollAfterUserScroll = useDebounce(
    () => {
      if (!isUnmount.current) {
        setLocalAutoScroll(autoScroll)
      }
    },
    autoScrollAfterUserScroll,
  );

  const onScroll = useThrottle(() => {
    setLocalAutoScroll(false);
    resetAutoScrollAfterUserScroll();
  });

  return { localAutoScroll, resetLocalAutoScroll, onScroll };
};
