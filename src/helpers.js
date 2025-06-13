export const generateSelectKey = (arr = []) => {
  return arr?.map((data, idx) => ({
    ...data,
    selectKey: idx,
  }));
};

export const onMultipleSelect = ({
  selectKey,
  dataSource,
  selectedKeyRef,
  direction,
  objSelectIdxRef,
}) => {
  if (selectKey < objSelectIdxRef?.current?.[direction]?.start) {
    objSelectIdxRef.current[direction].end =
      objSelectIdxRef?.current?.[direction]?.start;

    objSelectIdxRef.current[direction].start = selectKey;
  } else {
    objSelectIdxRef.current[direction].end = selectKey;
  }

  const selectedDatas = dataSource?.filter(
    (data) =>
      objSelectIdxRef?.current?.[direction]?.start <= data?.selectKey &&
      objSelectIdxRef?.current?.[direction]?.end >= data?.selectKey
  );

  if (
    selectedDatas?.every((data) =>
      selectedKeyRef?.current?.has(data?.selectKey)
    )
  ) {
    selectedDatas?.forEach((data) => {
      selectedKeyRef?.current.delete(data?.key);
    });
  } else {
    selectedDatas?.forEach((data) => {
      selectedKeyRef?.current.add(data?.key);
    });
  }

  objSelectIdxRef.current[direction].start = -1;
};

export const onOnceSelect = ({
  key,
  selectKey,
  selectedKeyRef,
  direction,
  objSelectIdxRef,
}) => {
  if (selectedKeyRef?.current?.has(key)) {
    selectedKeyRef?.current.delete(key);

    objSelectIdxRef.current[direction].start = -1;
  } else {
    selectedKeyRef?.current.add(key);

    objSelectIdxRef.current[direction].start = selectKey;
  }
};
