import { Pagination } from "antd";
import { memo } from "react";

const Footer_ = ({ page, setPage, datasLength }) => {
  if (datasLength > 0) {
    return (
      <Pagination
        simple
        current={page}
        total={datasLength}
        onChange={(currPage) => {
          setPage(currPage);
        }}
      />
    );
  }
  return null;
};

const Footer = memo(Footer_);
export default Footer;
