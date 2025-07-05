import { useTranslation } from "react-i18next";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Title from "../components/Title";
import "../styles/CommunityGuidelines.css";

const FadeInSection = ({ children, delay = 0 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "0px 0px -50px 0px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: "easeOut", delay }}
    >
      {children}
    </motion.div>
  );
};

const CommunityGuidelines = () => {
  const { t } = useTranslation();

  return (
    <div className="community-guidelines-page">
      <FadeInSection>
        <Title>{t("guidelines.mainTitle")}</Title>
        <p>{t("guidelines.introduction")}</p>
      </FadeInSection>

      <FadeInSection delay={0.2}>
        <Title level={2}>{t("guidelines.respectTitle")}</Title>
        <p>{t("guidelines.respectContent1")}</p>
        <p>{t("guidelines.respectContent2")}</p>
      </FadeInSection>

      <FadeInSection delay={0.2}>
        <Title level={2}>{t("guidelines.authenticTitle")}</Title>
        <p>{t("guidelines.authenticContent1")}</p>
        <p>{t("guidelines.authenticContent2")}</p>
      </FadeInSection>

      <FadeInSection delay={0.2}>
        <Title level={2}>{t("guidelines.photosTitle")}</Title>
        <p>{t("guidelines.photosContent1")}</p>
        <p>{t("guidelines.photosContent2")}</p>
      </FadeInSection>

      <FadeInSection delay={0.2}>
        <Title level={2}>{t("guidelines.reviewsTitle")}</Title>
        <p>{t("guidelines.reviewsContent1")}</p>
        <p>{t("guidelines.reviewsContent2")}</p>
      </FadeInSection>

      <FadeInSection delay={0.2}>
        <Title level={2}>{t("guidelines.prohibitedTitle")}</Title>
        <p>{t("guidelines.prohibitedContent1")}</p>
        <p>{t("guidelines.prohibitedContent2")}</p>
      </FadeInSection>

      <FadeInSection delay={0.2}>
        <Title level={2}>{t("guidelines.reportingTitle")}</Title>
        <p>{t("guidelines.reportingContent")}</p>
      </FadeInSection>

      <FadeInSection delay={0.2}>
        <Title level={2}>{t("guidelines.consequencesTitle")}</Title>
        <p>{t("guidelines.consequencesContent")}</p>
      </FadeInSection>

      <FadeInSection delay={0.2}>
        <Title level={2}>{t("guidelines.contactTitle")}</Title>
        <p>{t("guidelines.contactContent")}</p>
      </FadeInSection>
    </div>
  );
};

export default CommunityGuidelines;