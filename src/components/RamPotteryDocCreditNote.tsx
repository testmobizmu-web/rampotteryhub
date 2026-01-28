import React from "react";
import RamPotteryDoc, { RamPotteryDocProps } from "./RamPotteryDoc";

type CreditNoteDocProps = Omit<RamPotteryDocProps, "variant">;

export default function RamPotteryDocCreditNote(props: CreditNoteDocProps) {
  return <RamPotteryDoc {...props} variant="CREDIT_NOTE" />;
}

