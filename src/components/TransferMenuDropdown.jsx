import { DownOutlined } from "@ant-design/icons";
import { Dropdown, Menu, Space } from "antd";
import { memo } from "react";

const TransferMenuDropdown_ = ({
  setTriggerRender,
  selectedKeyRef,
  oriDatasRef,
  dataSource,
  titleDropdown,
  setObjLengthSelected,
  direction,
}) => {
  const menu = (
    <Menu>
      <Menu.Item
        key="select-all"
        onClick={() => {
          const isCheckedAll = oriDatasRef?.current?.every((data) =>
            selectedKeyRef?.current?.has(data?.key)
          );

          if (isCheckedAll) {
            selectedKeyRef?.current.clear();
          } else {
            oriDatasRef.current?.forEach((d) => {
              selectedKeyRef?.current.add(d.key);
            });
          }

          setObjLengthSelected((prev) => ({
            ...prev,
            [direction]: selectedKeyRef?.current?.size,
          }));

          setTriggerRender((prev) => prev + 1);
        }}
      >
        Select All Data
      </Menu.Item>
      <Menu.Item
        key="select-current"
        onClick={() => {
          const isCheckedAllCurrent = dataSource?.every((data) =>
            selectedKeyRef?.current?.has(data?.key)
          );

          if (isCheckedAllCurrent) {
            dataSource?.forEach((d) => {
              selectedKeyRef?.current.delete(d.key);
            });
          } else {
            dataSource?.forEach((d) => {
              selectedKeyRef?.current.add(d.key);
            });
          }

          setObjLengthSelected((prev) => ({
            ...prev,
            [direction]: selectedKeyRef?.current?.size,
          }));

          setTriggerRender((prev) => prev + 1);
        }}
      >
        Select Current Page
      </Menu.Item>
    </Menu>
  );
  return (
    <Dropdown overlay={menu} trigger={["click"]}>
      <a onClick={(e) => e?.preventDefault()}>
        <Space>
          {titleDropdown}
          <DownOutlined />
        </Space>
      </a>
    </Dropdown>
  );
};

const TransferMenuDropdown = memo(TransferMenuDropdown_);
export default TransferMenuDropdown;
