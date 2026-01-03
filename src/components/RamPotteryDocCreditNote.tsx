import React from "react";
import RamPotteryDoc, { RamPotteryDocProps } from "./RamPotteryDoc";

type CreditNoteDocProps = Omit<RamPotteryDocProps, "variant" | "tableHeaderRightTitle"> & {
  title?: string; // optional override
};

export default function RamPotteryDocCreditNote(props: CreditNoteDocProps) {
  const { title, ...rest } = props;

  return (
    <RamPotteryDoc
      {...rest}
      variant="CREDIT_NOTE"
      tableHeaderRightTitle={title || "CREDIT NOTE"}
    />
  );
}
