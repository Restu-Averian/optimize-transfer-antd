import { Button, Checkbox, Form, Input } from "antd";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import TransferComp from "./TransferComp";
import TransferWrapperStyled from "../styled/TransferWrapper.styled";
import { generateSelectKey } from "../helpers";

const mockData = Array.from({
  // length: 1000000,
  length: 300000,
  // length: 50000,
  // length: 30,
}).map((_, i) => ({
  //   key: i.toString(),
  // data: `content${i + 1}`,
  data: `content${i}`,
}));

const CustomTransfer_ = ({
  name,
  selectValue = "key",
  selectLabel = "data",
}) => {
  const formInstance = Form.useFormInstance();

  const [pageLeft, setPageLeft] = useState(1);
  const [pageRight, setPageRight] = useState(1);
  const [objLengthSelected, setObjLengthSelected] = useState({
    left: 0,
    right: 0,
  });
  const [isAllEmp, setAllEmp] = useState(false);

  const isInit = useRef(false);
  const oriDatasRef = useRef([]);
  const filterDatasRef = useRef([]);
  const targetKeysRef = useRef([]);
  const selectedKeyLeftRef = useRef(new Set([]));
  const selectedKeyRightRef = useRef(new Set([]));
  const objSelectIdxRef = useRef({
    start: -1,
    end: -1,
  });

  const filterDatasRight = useMemo(() => {
    const targetKeysRefSet = new Set(targetKeysRef?.current);

    if (targetKeysRef?.current?.length > 10000) {
      const datasRight = oriDatasRef.current?.filter((data) =>
        targetKeysRefSet?.has(data?.key)
      );

      return generateSelectKey(datasRight);
    } else {
      const datasRight = [];

      targetKeysRefSet?.forEach((targetKey) => {
        const objOriData = oriDatasRef.current.find(
          (oriData) => oriData?.key === targetKey
        );

        datasRight?.push(objOriData);
      });

      return generateSelectKey(datasRight);
    }
  }, [oriDatasRef.current, targetKeysRef?.current, filterDatasRef?.current]);

  const onFakeFetch = () => {
    return new Promise((resolve) => {
      // setTimeout(() => {
      //   resolve(mockData);
      // }, 1000);

      resolve(mockData);
    });
  };

  const fetchDatasource = async () => {
    try {
      const data = await onFakeFetch();

      const dataResult = generateSelectKey(
        data?.map((item, i) => ({
          ...item,
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

      setTimeout(() => {
        selectedKeyLeftRef?.current?.clear();
      }, 0);
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

      setTimeout(() => {
        selectedKeyRightRef?.current?.clear();
      }, 0);
    }

    objSelectIdxRef.current = {
      start: -1,
      end: -1,
    };
  };

  useEffect(() => {
    fetchDatasource();
  }, []);

  useEffect(() => {
    if (isInit.current) {
      formInstance?.setFieldsValue({
        [name]: filterDatasRight?.map((data) => data?.[selectValue]),
      });
    }
  }, [filterDatasRight]);

  return (
    <>
      <Form.Item name={name} hidden>
        <Input />
      </Form.Item>

      <Checkbox
        onChange={({ target: { checked } }) => {
          setAllEmp(checked);

          const isAllTargetted =
            objLengthSelected?.right === oriDatasRef?.current?.length;

          if (checked && !isAllTargetted) {
            console.log("ss", {
              rightLength: objLengthSelected?.right,
              oriDa: oriDatasRef?.current?.length,
            });
            const allOriDatas = oriDatasRef.current?.map((data) => data?.key);

            selectedKeyLeftRef.current = new Set(allOriDatas);

            onUpdate({ from: "left" });

            setObjLengthSelected((prev) => ({
              ...prev,
              left: 0,
              right: oriDatasRef?.current?.length,
            }));
          }
        }}
      >
        All Employee
      </Checkbox>

      {!isAllEmp && (
        <TransferWrapperStyled>
          <TransferComp
            dataSource={filterDatasRef.current}
            page={pageLeft}
            setPage={setPageLeft}
            selectedKeyRef={selectedKeyLeftRef}
            objLengthSelected={objLengthSelected}
            setObjLengthSelected={setObjLengthSelected}
            direction="left"
            objSelectIdxRef={objSelectIdxRef}
          />

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <Button
              icon={<RightOutlined />}
              disabled={objLengthSelected?.left === 0}
              {...(objLengthSelected?.left > 0 && {
                onClick: () => {
                  onUpdate({
                    from: "left",
                  });
                },
              })}
            />
            <Button
              icon={<LeftOutlined />}
              disabled={objLengthSelected?.right === 0}
              {...(objLengthSelected?.right > 0 && {
                onClick: () => {
                  onUpdate({
                    from: "right",
                  });
                },
              })}
            />
          </div>

          <TransferComp
            dataSource={filterDatasRight}
            page={pageRight}
            setPage={setPageRight}
            selectedKeyRef={selectedKeyRightRef}
            objLengthSelected={objLengthSelected}
            setObjLengthSelected={setObjLengthSelected}
            direction="right"
            objSelectIdxRef={objSelectIdxRef}
          />
        </TransferWrapperStyled>
      )}
    </>
  );
};

const CustomTransfer = memo(CustomTransfer_);
export default CustomTransfer;
