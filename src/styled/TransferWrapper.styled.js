import styled from "styled-components";

const TransferWrapperStyled = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;

  .ant-transfer {
    .ant-transfer-operation {
      display: none;
    }

    .ant-transfer-list {
      &:nth-last-child(1) {
        display: none;
      }
    }
  }
`;
export default TransferWrapperStyled;
