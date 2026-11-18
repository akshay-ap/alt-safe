import type React from "react";
import PageHeader from "./PageHeader";

interface TitleProps {
  text: string;
  description?: React.ReactNode;
}

/** Kept for existing pages; renders the shared page header so every page has the same heading. */
const Title: React.FC<TitleProps> = ({ text, description }) => <PageHeader title={text} description={description} />;

export default Title;
