import { ClimbingBoxLoader } from 'react-spinners';
import PropTypes from 'prop-types';

const SpinnerCeiJa = ({ size = 18, color = '#2d4177', className = '', text = '', style = {} }) => (
  <div className={`cei-spinner ${className}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', ...style }}>
    <ClimbingBoxLoader color={color} size={size} />
    {text && <span style={{ marginTop: 8, color: '#2d4177', fontWeight: 500 }}>{text}</span>}
  </div>
);

SpinnerCeiJa.propTypes = {
  size: PropTypes.number,
  color: PropTypes.string,
  className: PropTypes.string,
  text: PropTypes.string,
  style: PropTypes.object
};

export default SpinnerCeiJa;
