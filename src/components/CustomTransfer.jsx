import { Checkbox, Form, Skeleton, Table, Transfer, Typography } from "antd";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { generateSelectKey, onMultipleSelect, onOnceSelect } from "../helpers";
import TransferMenuDropdown from "./TransferMenuDropdown";
import TransferFooter from "./TransferFooter";
import { LIMIT_PAGE, NUM_SEARCH_USE_LOADING } from "../constant";

const mockData = Array.from({
  // length: 1000000,
  // length: 300000,
  // length: 50000,
  length: 48000,
  // length: 30,
}).map((_, i) => ({
  //   key: i.toString(),
  // data: `content${i + 1}`,
  data: `content${i}`,
  description: `descriptioncontent${i}`,
  aaaaa: `descriptioncontent${i}`,
  bbbbb: `bbbbb${i}`,
  ccccc: `ccccc${i}`,
  ddddd: `ddd${i}`,
  eeeee: `eeee${i}`,
  fffff: `ffff${i}`,
  ggggg: `gggg${i}`,
  hhhhh: `hhhh${i}`,
  iiiii: `iiii${i}`,
  jjjjj: `jjjj${i}`,
  kkkkk: `kkkk${i}`,
  lllll: `lllll${i}`,
  mmmmm: `mmmm${i}`,
  nnnnn: `nnnnn${i}`,
  ooooo: `oooooo${i}`,
}));

const { Text } = Typography;

const arrDatasLoading = Array.from({
  length: 5,
})?.map((_, idx) => ({
  key: idx,
  selectKey: idx,
}));

const CustomTransfer_ = ({
  name,
  selectValue = "key",
  selectLabel = "data",
}) => {
  const formInstance = Form.useFormInstance();

  const [isAllEmp, setAllEmp] = useState(false);
  const [loadingLeft, setLoadingLeft] = useState(true);
  const [loadingRight, setLoadingRight] = useState(true);
  const [pageLeft, setPageLeft] = useState(1);
  const [pageRight, setPageRight] = useState(1);
  const [searchLeftValue, setSearchLeftValue] = useState("");
  const [searchRightValue, setSearchRightValue] = useState("");
  const [objLengthSelected, setObjLengthSelected] = useState({
    left: 0,
    right: 0,
  });

  const isInit = useRef(false);
  const timeoutSearchRef = useRef(null);
  const searchLeftValueRef = useRef("");
  const searchRightValueRef = useRef("");
  const oriDatasRef = useRef([]);
  const filterDatasRef = useRef([]);
  const targetKeysRef = useRef([]);
  const selectedKeyLeftRef = useRef(new Set([]));
  const selectedKeyRightRef = useRef(new Set([]));
  const objSelectIdxRef = useRef({
    left: {
      start: -1,
      end: -1,
    },
    right: {
      start: -1,
      end: -1,
    },
  });

  const filterDatasRight = useMemo(() => {
    const targetKeysRefSet = new Set(targetKeysRef?.current);

    if (targetKeysRef?.current?.length > 10000) {
      const datasRight = oriDatasRef.current?.filter((data) =>
        targetKeysRefSet?.has(data?.key)
      );

      if (searchRightValue?.trim() !== "") {
        const datasRightBySearch = datasRight?.filter((data) =>
          data?.[selectLabel]
            ?.toString()
            ?.toLowerCase()
            ?.trim()
            ?.includes(searchRightValue?.toLowerCase()?.trim())
        );

        return generateSelectKey(datasRightBySearch);
      }
      return generateSelectKey(datasRight);
    } else {
      const datasRight = [];

      targetKeysRefSet?.forEach((targetKey) => {
        const objOriData = oriDatasRef.current.find(
          (oriData) => oriData?.key === targetKey
        );

        datasRight?.push(objOriData);
      });

      if (searchRightValue?.trim() !== "") {
        const datasRightBySearch = datasRight?.filter((data) =>
          data?.[selectLabel]
            ?.toString()
            ?.toLowerCase()
            ?.trim()
            ?.includes(searchRightValue?.toLowerCase()?.trim())
        );

        return generateSelectKey(datasRightBySearch);
      }

      return generateSelectKey(datasRight);
    }
  }, [
    oriDatasRef.current,
    targetKeysRef?.current,
    searchRightValue,
    objLengthSelected?.right,
  ]);

  const onFakeFetch = () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockData);
        // }, 2000);
      }, 1000);
    });
  };

  const fetchDatasource = async () => {
    try {
      const data = await onFakeFetch();

      const dataResult = generateSelectKey(
        data?.map((item, i) => ({
          // ...item,
          [selectValue]: item?.[selectValue],
          data: item?.[selectLabel],
          key: i,
        }))
      );

      oriDatasRef.current = dataResult;

      const formValue = formInstance?.getFieldValue(name) ?? [];

      const targetDatas = dataResult?.filter((item) =>
        formValue?.includes(item?.[selectValue])
      );

      const initFilterData = dataResult?.filter(
        (item) => !formValue?.includes(item?.[selectValue])
      );

      targetKeysRef.current = targetDatas?.map((item) => item?.key);

      filterDatasRef.current = initFilterData;

      setObjLengthSelected({
        left: 0,
        right: 0,
      });
    } catch (err) {
      console.log("er;  ", err);
    } finally {
      isInit.current = true;

      setLoadingLeft(false);
      setLoadingRight(false);
    }
  };

  /**
   *
   * @param {object} props
   * @param {'left' | 'right'} props.from
   */
  const onUpdate = ({ from }) => {
    if (from === "left") {
      const updtdFilterDatas = filterDatasRef?.current?.filter((data) => {
        return !selectedKeyLeftRef.current?.has(data?.key);
      });

      const newTargetKeys = [];

      selectedKeyLeftRef.current.forEach((key) => {
        newTargetKeys.push(key);
      });

      targetKeysRef?.current.forEach((key) => {
        newTargetKeys.push(key);
      });

      targetKeysRef.current = newTargetKeys;

      filterDatasRef.current = generateSelectKey(updtdFilterDatas);

      setObjLengthSelected((prev) => ({
        ...prev,
        left: 0,
      }));

      selectedKeyLeftRef?.current?.clear();
    } else {
      const targetKeysRefSet = new Set(targetKeysRef?.current);

      const newFilterDatas = filterDatasRight?.filter((data) =>
        selectedKeyRightRef?.current?.has(data?.key)
      );

      selectedKeyRightRef?.current?.forEach((key) => {
        targetKeysRefSet?.delete(key);
      });

      targetKeysRef.current = Array.from(targetKeysRefSet);

      filterDatasRef.current = generateSelectKey([
        ...newFilterDatas,
        ...filterDatasRef.current,
      ]);

      setObjLengthSelected((prev) => ({
        ...prev,
        right: 0,
      }));

      selectedKeyRightRef?.current?.clear();
    }

    objSelectIdxRef.current[from] = {
      start: -1,
      end: -1,
    };
  };

  const onFilterDatas = useCallback(
    ({ direction }) => {
      const page = direction === "left" ? pageLeft : pageRight;
      const dataSource =
        direction === "left" ? filterDatasRef?.current : filterDatasRight;

      const start = (page - 1) * LIMIT_PAGE;
      const end = page * LIMIT_PAGE;

      return dataSource?.slice(start, end);
    },
    [pageLeft, pageRight, filterDatasRef?.current, filterDatasRight]
  );

  const onSearch = useCallback(
    ({ direction, value }) => {
      if (direction === "left") {
        const targetKeysRefSet = new Set(targetKeysRef?.current || []);

        const leftDatas = oriDatasRef?.current?.filter(
          (data) => !targetKeysRefSet?.has(data?.key)
        );

        const newFilterDatas =
          value?.trim() === ""
            ? leftDatas
            : leftDatas?.filter((data) => {
                return data?.[selectLabel]
                  ?.toString()
                  ?.toLowerCase()
                  ?.includes(value);
              });

        filterDatasRef.current = newFilterDatas;

        if (oriDatasRef?.current?.length > NUM_SEARCH_USE_LOADING) {
          searchLeftValueRef.current = value;
        } else {
          setSearchLeftValue(value);
        }
      } else {
        if (oriDatasRef?.current?.length > NUM_SEARCH_USE_LOADING) {
          searchRightValueRef.current = value;
        } else {
          setSearchRightValue(value);
        }
      }
    },
    [
      selectLabel,
      filterDatasRef?.current,
      oriDatasRef?.current,
      targetKeysRef?.current,
      searchLeftValueRef?.current,
      searchRightValue?.current,
      searchLeftValue,
      searchRightValue,
    ]
  );

  useEffect(() => {
    fetchDatasource();
  }, [selectLabel, selectValue]);

  useEffect(() => {
    if (isInit.current) {
      formInstance?.setFieldsValue({
        [name]: filterDatasRight?.map((data) => data?.[selectValue]),
      });
    }
  }, [filterDatasRight]);

  return (
    <Form.Item label="Restu" name={name} rules={[{ required: true }]}>
      <Checkbox
        onChange={({ target: { checked } }) => {
          setAllEmp(checked);

          const isAllTargetted =
            targetKeysRef?.current?.length === oriDatasRef?.current?.length;

          if (checked && !isAllTargetted) {
            const allKeyOriDatas = oriDatasRef.current?.map(
              (data) => data?.key
            );

            selectedKeyLeftRef.current = new Set(allKeyOriDatas);

            onUpdate({ from: "left" });

            setObjLengthSelected((prev) => ({
              ...prev,
              right: oriDatasRef?.current?.length,
            }));
          }
        }}
      >
        All Employee
      </Checkbox>

      {isAllEmp ? null : (
        <Transfer
          selectedKeys={[
            ...Array.from(selectedKeyLeftRef.current).slice(0, 1),
            ...Array.from(selectedKeyRightRef.current).slice(0, 1),
          ]}
          targetKeys={targetKeysRef.current}
          showSearch
          onSearch={(direction, value) => {
            if (oriDatasRef?.current?.length >= NUM_SEARCH_USE_LOADING) {
              if (direction === "left") {
                setLoadingLeft(true);
              } else {
                setLoadingRight(true);
              }

              clearTimeout(timeoutSearchRef?.current);
              timeoutSearchRef.current = setTimeout(() => {
                onSearch({
                  direction,
                  value: value?.trim()?.toLowerCase(),
                });

                if (direction === "left") {
                  setLoadingLeft(false);
                } else {
                  setLoadingRight(false);
                }
              }, 250);
            } else {
              onSearch({
                direction,
                value: value?.trim()?.toLowerCase(),
              });
            }
          }}
          showSelectAll={false}
          selectAllLabels={[
            <TransferMenuDropdown
              dataSourceByPage={onFilterDatas({ direction: "left" })}
              dataSourceByDirection={filterDatasRef?.current}
              selectedKeyRef={selectedKeyLeftRef}
              objLengthSelected={objLengthSelected}
              setObjLengthSelected={setObjLengthSelected}
              direction={"left"}
              objSelectIdxRef={objSelectIdxRef}
              key="transfer-dropdown-left"
              page={pageLeft}
              searchValue={
                oriDatasRef?.current?.length >= NUM_SEARCH_USE_LOADING
                  ? searchLeftValueRef?.current
                  : searchLeftValue
              }
              selectLabel={selectLabel}
            />,
            <TransferMenuDropdown
              dataSourceByPage={onFilterDatas({ direction: "right" })}
              dataSourceByDirection={filterDatasRight}
              selectedKeyRef={selectedKeyRightRef}
              objLengthSelected={objLengthSelected}
              setObjLengthSelected={setObjLengthSelected}
              direction={"right"}
              objSelectIdxRef={objSelectIdxRef}
              key="transfer-dropdown-right"
              page={pageRight}
              searchValue={
                oriDatasRef?.current?.length >= NUM_SEARCH_USE_LOADING
                  ? searchRightValueRef?.current
                  : searchRightValue
              }
              selectLabel={selectLabel}
            />,
          ]}
          footer={(_, { direction }) => {
            if (direction === "left") {
              return (
                <TransferFooter
                  page={pageLeft}
                  setPage={setPageLeft}
                  datasLength={filterDatasRef?.current?.length}
                />
              );
            }
            return (
              <TransferFooter
                page={pageRight}
                setPage={setPageRight}
                datasLength={filterDatasRight?.length}
              />
            );
          }}
          onChange={(_, destDirection) => {
            onUpdate({ from: destDirection === "right" ? "left" : "right" });
          }}
          listStyle={{ minWidth: 300, width: 300, maxWidth: 300, height: 480 }}
        >
          {({ direction }) => {
            const selectedKeyRef =
              direction === "left" ? selectedKeyLeftRef : selectedKeyRightRef;

            const loading = direction === "left" ? loadingLeft : loadingRight;

            const dataSource = loading
              ? arrDatasLoading
              : onFilterDatas({ direction });

            return (
              <Table
                dataSource={dataSource}
                showHeader={false}
                size="small"
                columns={[
                  {
                    key: "selected",
                    dataIndex: "selected",
                    render: (_, record) => {
                      if (loading) {
                        return <Skeleton.Avatar active shape="circle" />;
                      }
                      return (
                        <Checkbox
                          checked={selectedKeyRef?.current?.has(record?.key)}
                        />
                      );
                    },
                    width: 5,
                  },
                  {
                    key: "data",
                    dataIndex: "data",
                    render: (_, record) => {
                      if (loading) {
                        return <Skeleton.Input active />;
                      }
                      return (
                        <div>
                          <Text>{record?.data}</Text>
                        </div>
                      );
                    },
                  },
                ]}
                onRow={({ key, selectKey }) => {
                  return {
                    onDoubleClick: () => {
                      onUpdate({ from: direction });

                      setObjLengthSelected((prev) => ({
                        ...prev,
                        [direction]: selectedKeyRef?.current?.size,
                      }));
                    },
                    onClick: (e) => {
                      if (
                        e?.shiftKey &&
                        objSelectIdxRef?.current?.[direction]?.start !== -1
                      ) {
                        onMultipleSelect({
                          selectKey,
                          dataSource:
                            direction === "left"
                              ? filterDatasRef.current
                              : filterDatasRight,
                          selectedKeyRef,
                          direction,
                          objSelectIdxRef,
                        });
                      } else {
                        onOnceSelect({
                          key,
                          selectKey,
                          selectedKeyRef,
                          direction,
                          objSelectIdxRef,
                        });
                      }

                      setObjLengthSelected((prev) => ({
                        ...prev,
                        [direction]: selectedKeyRef?.current?.size,
                      }));
                    },
                  };
                }}
                pagination={false}
              />
            );
          }}
        </Transfer>
      )}
    </Form.Item>
  );
};

const CustomTransfer = memo(CustomTransfer_);
export default CustomTransfer;
