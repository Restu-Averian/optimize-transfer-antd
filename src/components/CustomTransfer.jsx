import { Button, Form, Input } from "antd";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import TransferComp from "./TransferComp";
import TransferWrapperStyled from "../styled/TransferWrapper.styled";

const mockData = Array.from({
  length: 1000000,
  // length: 30,
}).map((_, i) => ({
  //   key: i.toString(),
  // data: `content${i + 1}`,
  data: `content${i}`,
}));

const CustomTransfer_ = ({ name, selectValue = "key" }) => {
  const formInstance = Form.useFormInstance();

  const [filterDatas, setFilterDatas] = useState([]);
  const [pageLeft, setPageLeft] = useState(1);
  const [pageRight, setPageRight] = useState(1);
  const [objLengthSelected, setObjLengthSelected] = useState({
    left: 0,
    right: 0,
  });

  const isInit = useRef(false);
  const oriDatasRef = useRef([]);
  const targetKeysRef = useRef([]);
  const selectedKeyLeftRef = useRef(new Set([]));
  const selectedKeyRightRef = useRef(new Set([]));

  const filterDatasRight = useMemo(() => {
    const targetKeysRefSet = new Set(targetKeysRef?.current);

    if (targetKeysRef?.current?.length > 10000) {
      return oriDatasRef.current?.filter((data) =>
        targetKeysRefSet?.has(data?.key)
      );
    } else {
      const datasRight = [];

      targetKeysRefSet?.forEach((targetKey) => {
        const objOriData = oriDatasRef.current.find(
          (oriData) => oriData?.key === targetKey
        );

        datasRight?.push(objOriData);
      });

      return datasRight;
    }
  }, [oriDatasRef.current, targetKeysRef?.current, filterDatas]);

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

      const dataResult = data?.map((item, i) => ({
        ...item,
        // key: i?.toString(),
        key: i,
      }));

      oriDatasRef.current = dataResult;

      const formValue = formInstance?.getFieldValue(name) ?? [];

      const targetDatas = dataResult?.filter((item) =>
        formValue?.includes(item?.[selectValue])
      );

      const initFilterData = dataResult?.filter(
        (item) => !formValue?.includes(item?.[selectValue])
      );

      targetKeysRef.current = targetDatas?.map((item) => item?.key);

      setFilterDatas(initFilterData);
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
      const updtdFilterDatas = filterDatas?.filter((data) => {
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

      setFilterDatas(updtdFilterDatas);

      setTimeout(() => {
        selectedKeyLeftRef?.current?.clear();

        setObjLengthSelected((prev) => ({
          ...prev,
          left: 0,
        }));
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

      setFilterDatas([...newFilterDatas, ...filterDatas]);

      setTimeout(() => {
        selectedKeyRightRef?.current?.clear();

        setObjLengthSelected((prev) => ({
          ...prev,
          right: 0,
        }));
      }, 0);
    }
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
    <TransferWrapperStyled>
      <Form.Item name={name} hidden>
        <Input />
      </Form.Item>

      <TransferComp
        dataSource={filterDatas}
        page={pageLeft}
        setPage={setPageLeft}
        selectedKeyRef={selectedKeyLeftRef}
        objLengthSelected={objLengthSelected}
        setObjLengthSelected={setObjLengthSelected}
        direction="left"
        targetKeysRef={targetKeysRef}
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
        targetKeysRef={targetKeysRef}
      />
    </TransferWrapperStyled>
  );
};

const CustomTransfer = memo(CustomTransfer_);
export default CustomTransfer;
