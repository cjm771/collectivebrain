import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

let refreshDebounceTimer;

export default (action = null, _ref = null, _refChildSelector = null, data = {}, user = {}, _limit = 10, _offset = 0) => {
  if (!action) {
    throw 'Action must be specified as first parameter.';
  }
  if (!_ref) {
    throw 'Ref must be specified as second parameter.';
  }

  /*********
   * VARS
   *********/

  const REFRESH_DEBOUNCE_MS = 500;

  /*********
   * HOOKS
   ********/

  // const postListRef = useRef();
  const dispatch = useDispatch();
  const [limit] = useState(_limit);
  const [offset, setOffset] = useState(data.next || _offset);
  const [shouldReset, setShouldReset] = useState(0);
  const [sortInited, setSortInited] = useState(false);
  const [shouldFetch, setShouldFetch] = useState(0);
  const [isFetching, setIsFetching] = useState(false);

  // when we recieve new offset..do dispatch

  // when dom ready lets handle scroll
  useEffect(() => {
    if (_ref.current) {
      handleScroll();
    }
  }, [_ref]);

  // when we update the offset lets rerun scroll..
  useEffect(() => {
    handleScroll();
  }, [offset]);

  // run infinitely
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  });
  useEffect(() => {
    if (!!shouldReset) {
      triggerRefresh();
    }
  }, [shouldReset]);

  useEffect(() => {
    if (!sortInited) {
      setSortInited(true);
    } else {
      setShouldReset(shouldReset + 1);
    }
  }, [data.sort.by, data.sort.dir, data.filter]);

  // to prevent multiple triggered events it is only triggered when use ready to fetch
  useEffect(() => {
    try {
      clearTimeout(refreshDebounceTimer);
    } catch (e) {
      // pass
    }
    refreshDebounceTimer = setTimeout(() => {
      if (user && user.loggedIn && (!!shouldFetch && !isFetching && (!!shouldReset || data.next !== null))) {
        const actionResult = action({
          group: user.activeGroup.id,
          reset: !!shouldReset,
          limit,
          offset,
          sort: data.sort,
          filter: data.filter,
        });
        setIsFetching(false);
        dispatch(actionResult)
          .then((data) => {
            if (data.next) {
              setOffset(data.next);
            }
          })
          .finally(() => {
        setIsFetching(false);
            setShouldFetch(0);
            setShouldReset(0);
            setIsFetching(false);
            handleScroll();
          });
      } else {
      }
    }, REFRESH_DEBOUNCE_MS);
  }, [shouldFetch, isFetching, user]);

  /*********
   * HELPERS
   ********/

  const triggerRefresh = () => {
    setShouldFetch(shouldFetch + 1);
  };

  const handleScroll = () => {
    if (_ref.current) {
      const lastLi = _refChildSelector ? _ref.current.querySelector(_refChildSelector) : _ref.current;
      var lastLiOffset = lastLi ? lastLi.offsetTop + lastLi.clientHeight : 0;
      var pageOffset = window.pageYOffset + window.innerHeight;
      if (pageOffset >= lastLiOffset) {
      setShouldFetch(true);
        triggerRefresh();
      }
    }
  };

  return data;
};
