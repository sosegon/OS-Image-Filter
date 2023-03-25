import React, { useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const ExtensionSettingsContext = React.createContext({});
const ExtensionSettingsConsumer = ExtensionSettingsContext.Consumer;
const useExtensionSettingsContext = () => useContext(ExtensionSettingsContext);

function ExtensionSettingsProvider(props) {
  const { settings, children } = props
  const [settingsInfo, setSettingsInfo] = useState(settings);

  useEffect(() => {
    setSettingsInfo(settings);
  }, [settings]);

  const updateSettingsInfo = (params) => {
    Object.assign(settingsInfo, params);
    setSettingsInfo(settingsInfo);
  }

  const context = {
    settings: settingsInfo,
    updateSettingsInfo,
  }

  return (
    <ExtensionSettingsContext.Provider value={context}>{children}</ExtensionSettingsContext.Provider>
  );
}

ExtensionSettingsProvider.propTypes = {
  settings: PropTypes.object,
  children: PropTypes.node,
};

ExtensionSettingsProvider.defaultProps = {
  settings: {},
  children: null,
};

export default useExtensionSettingsContext;

export { ExtensionSettingsProvider, ExtensionSettingsConsumer, ExtensionSettingsContext };