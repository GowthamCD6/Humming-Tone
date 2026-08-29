import React, { createContext, useState, useEffect, useContext } from 'react';
import { SiteContentService } from '../api/services';

const SiteContentContext = createContext();

const DEFAULT_GENDERS = ['Men', 'Women', 'Children', 'Baby', 'Sports', 'Customize'];

export const SiteContentProvider = ({ children }) => {
  const [siteContent, setSiteContent] = useState(null);
  const [activeGenders, setActiveGenders] = useState(DEFAULT_GENDERS);
  const [genderCategories, setGenderCategories] = useState({});
  const [shippingFee, setShippingFee] = useState(0);
  const [gstRate, setGstRate] = useState(5);
  const [loading, setLoading] = useState(true);

  const loadContent = async () => {
    try {
      setLoading(true);
      const data = await SiteContentService.fetchSiteContent();
      setSiteContent(data);

      const statusMap = data.genderStatus || {};
      const catMap = data.genderCategory || {};

      const activeList = Object.keys(statusMap).filter((g) => statusMap[g] === true);
      const genders = activeList.length > 0 ? activeList : DEFAULT_GENDERS;

      const order = ['Men', 'Women', 'Children', 'Baby', 'Sports', 'Customize'];
      const sorted = [...genders].sort((a, b) => {
        const idxA = order.indexOf(a);
        const idxB = order.indexOf(b);
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;
        return 0;
      });

      setActiveGenders(sorted);
      setGenderCategories(catMap);
      setShippingFee(Number(data.shippingFee != null ? data.shippingFee : (data.footer?.shippingFee || 0)));
      setGstRate(Number(data.gstRate != null ? data.gstRate : (data.footer?.gstRate || 5)));
    } catch (error) {
      console.warn('Using fallback site content:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContent();
  }, []);

  return (
    <SiteContentContext.Provider
      value={{
        siteContent,
        activeGenders,
        genderCategories,
        shippingFee,
        gstRate,
        loading,
        refreshSiteContent: loadContent,
      }}
    >
      {children}
    </SiteContentContext.Provider>
  );
};

export const useSiteContent = () => useContext(SiteContentContext);
