import {useEffect, useState} from 'react';
import {useDispatch} from 'react-redux';


export default (action=null, _ref=null, _refChildSelector=null, data={}, _limit=10,_offset=0) => {
  if (!action) {
    throw 'Action must be specified as first parameter.';
  }
  if (!_ref) {
    throw 'Ref must be specified as second parameter.'
  }

  /*********
   * VARS
   *********/

  let infiniteScrolltimer = null;

  /*********
   * HOOKS
  ********/

  // const postListRef = useRef();
  const dispatch = useDispatch();
  const [limit] = useState(_limit);
  const [offset, setOffset] = useState(data.next || _offset);
  const [shouldFetch, setShouldFetch] = useState(true);
  const [isFetching, setIsFetching] = useState(false);

  // when we recieve new offset..do dispatch

  // when dom ready lets handle scroll
  useEffect(() => {
    if (_ref.current) {
      handleScroll();
    }
  }, [_ref])

  // when we update the offset lets rerun scroll..
  useEffect(() => {
    handleScroll();
  }, [offset]);

  // run infinitely 
  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  });

  // to prevent multiple triggered events it is only triggered when use ready to fetch
  useEffect(() => {
    if (shouldFetch && !isFetching && data.next !== null) {
      setIsFetching(true);
      dispatch(action({
        limit: limit,
        offset: offset
      })).then((data) => {
        if (data.next) {
          setOffset(data.next);
        }
      }).finally(() => {
        setShouldFetch(false);
        setIsFetching(false);
        handleScroll();
      });
    }
  }, [shouldFetch, isFetching])

      
  /*********
   * HELPERS
   ********/


  const handleScroll = () => {  
    const lastLi = _refChildSelector ? _ref.current.querySelector(_refChildSelector) : _ref.current;
    var lastLiOffset = lastLi.offsetTop + lastLi.clientHeight;
    var pageOffset = window.pageYOffset + window.innerHeight;
    if (pageOffset > lastLiOffset) {
      setShouldFetch(true);
    }
  };


  return data;

  
};