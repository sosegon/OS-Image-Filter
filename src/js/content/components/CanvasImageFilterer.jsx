import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';

const CanvasImageFilterer = forwardRef(({ id }, ref) => {
  return <canvas id={id} style={{ display: 'none' }} ref={ref} />;
});


export default CanvasImageFilterer;

CanvasImageFilterer.propTypes = {
  id: PropTypes.string.isRequired,
};
