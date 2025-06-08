import { useState, useRef, useEffect } from 'react';
import { lifestyleEquivalents, aiModels } from '../data/energyData';
import InfoModal from './InfoModal';
import './EnergyConverter.css';

const EnergyConverter = () => {
  // Constants for daily household usage
  const DAILY_HOUSEHOLD_ENERGY = 28.77; // kWh (10,500 kWh/year ÷ 365 days)
  const DAILY_HOUSEHOLD_WATER = 300; // Gallons per day

  // Helper function to handle singular/plural units
  const getUnitText = (value, unit) => {
    // Round the value to 2 decimal places for comparison
    const roundedValue = Math.round(value * 100) / 100;
    
    // Handle the case where unit is a string (like "Queries")
    if (typeof unit === 'string') {
      const singularUnit = unit.endsWith('s') ? unit.slice(0, -1) : unit;
      return roundedValue === 1 ? singularUnit : unit;
    }
    // Handle the case where unit is an object with singular/plural forms
    if (unit && typeof unit === 'object' && 'singular' in unit && 'plural' in unit) {
      return roundedValue === 1 ? unit.singular : unit.plural;
    }
    // If we get here, something is wrong with the unit format
    console.warn('Invalid unit format:', unit);
    return '';
  };

  // Drag sensitivity - pixels needed to move for one increment
  const PIXELS_PER_INCREMENT = 5;

  // Energy values in kWh (converting Wh to kWh)
  const MODEL_ENERGY_PER_QUERY = {
    optimistic: 0.00006,  // 0.06 Wh -> kWh
    pessimistic: 0.04,    // 40 Wh -> kWh
    neutral: 0.003       // 3 Wh -> kWh (baseline)
  };

  // Water values in gallons
  const MODEL_WATER_PER_QUERY = {
    optimistic: 0.066,    // 0.066 gallons (250mL)
    pessimistic: 0.264,   // 0.264 gallons (1000mL)
    neutral: 0.132        // 0.132 gallons (500mL) (baseline)
  };

  const ESTIMATE_EMOJIS = {
    optimistic: '😊',
    neutral: '😐',
    pessimistic: '😟'
  };

  const TYPE_EMOJIS = {
    energy: '⚡️',
    water: '💧'
  };

  // Format number for display based on which side was last dragged
  const formatNumber = (num, side) => {
    if (num === undefined || num === null) return '0';
    
    // Left side is always whole numbers
    if (side === 'left') {
      return Math.round(num).toString();
    }
    
    // For right side values
    if (side === 'right') {
      // First check if it's exactly 1 or very close to 1
      if (Math.abs(num - 1) < 0.0001 || num === 1) {
        return '1';
      }
      
      // If being dragged, show whole numbers
      if (isDragging === 'right' || lastDraggedSide === 'right') {
        return Math.round(num).toString();
      }
      
      // Otherwise show up to 2 decimal places, but only if needed
      const rounded = Math.round(num * 100) / 100;
      if (rounded === 1) return '1';
      return rounded % 1 === 0 ? Math.round(rounded).toString() : rounded.toFixed(2);
    }
    
    return num.toString();
  };

  // Calculate the right side value (no rounding)
  const calculateRightValue = (leftValue, type, est, equiv) => {
    const modelUsage = type === 'energy' 
      ? MODEL_ENERGY_PER_QUERY[est]
      : MODEL_WATER_PER_QUERY[est];
    const equivalent = lifestyleEquivalents[type][equiv];
    
    return (modelUsage * leftValue) / equivalent.value;
  };

  // Calculate the left side value based on right side value (no rounding)
  const calculateLeftValue = (rightValue, type, est, equiv) => {
    const modelUsage = type === 'energy' 
      ? MODEL_ENERGY_PER_QUERY[est]
      : MODEL_WATER_PER_QUERY[est];
    const equivalent = lifestyleEquivalents[type][equiv];
    
    return (rightValue * equivalent.value) / modelUsage;
  };

  const [measurementType, setMeasurementType] = useState('water');
  const [selectedEquivalent, setSelectedEquivalent] = useState('burger');
  const [estimate, setEstimate] = useState('neutral');
  const [isEditingLeft, setIsEditingLeft] = useState(false);
  const [isEditingRight, setIsEditingRight] = useState(false);
  const [rightSideValue, setRightSideValue] = useState(0);
  const [queryCount, setQueryCount] = useState(0);
  const [isDragging, setIsDragging] = useState(null);
  const [lastDraggedSide, setLastDraggedSide] = useState(null);
  const dragStartXRef = useRef(0);
  const dragStartValueRef = useRef(0);
  const lastIncrementRef = useRef(0);
  const dragStartQueryCountRef = useRef(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTogglingType, setIsTogglingType] = useState(false);

  // Helper function to round numbers based on their magnitude
  const roundNumber = (num) => {
    if (num >= 100) return Math.round(num);
    if (num >= 10) return Math.round(num * 10) / 10;
    if (num >= 1) return Math.round(num * 100) / 100;
    return Math.round(num * 1000) / 1000;
  };

  // Calculate percentage of daily household usage
  const calculatePercentage = (value, type, est) => {
    const dailyTotal = type === 'energy' ? DAILY_HOUSEHOLD_ENERGY : DAILY_HOUSEHOLD_WATER;
    const modelUsage = type === 'energy' 
      ? MODEL_ENERGY_PER_QUERY[est]
      : MODEL_WATER_PER_QUERY[est];
    
    // Calculate the actual resource usage (energy or water)
    const resourceUsage = value * modelUsage;
    const percentage = (resourceUsage / dailyTotal) * 100;
    return percentage < 0.01 ? '< 0.01' : roundNumber(percentage);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e) => {
      e.preventDefault();
      const deltaX = e.clientX - dragStartXRef.current;
      const currentIncrement = Math.floor(deltaX / PIXELS_PER_INCREMENT);
      
      if (currentIncrement !== lastIncrementRef.current) {
        const change = currentIncrement - lastIncrementRef.current;
        lastIncrementRef.current = currentIncrement;

        if (isDragging === 'left') {
          const newQueryCount = Math.max(1, Math.round(queryCount + change));
          setQueryCount(newQueryCount);
          setRightSideValue(calculateRightValue(newQueryCount, measurementType, estimate, selectedEquivalent));
        } else {
          const newRightValue = Math.max(1, Math.round(rightSideValue + change));
          setRightSideValue(newRightValue);
          // Always round the query count since left side is always whole numbers
          setQueryCount(Math.round(calculateLeftValue(newRightValue, measurementType, estimate, selectedEquivalent)));
        }
      }
    };

    const handleMouseUp = () => {
      setLastDraggedSide(isDragging); // Store which side was last dragged
      setIsDragging(null);
      lastIncrementRef.current = 0;
      document.body.style.cursor = '';
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    document.body.style.cursor = 'ew-resize';
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.body.style.cursor = '';
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, queryCount, rightSideValue, measurementType, estimate, selectedEquivalent]);

  // Effect to update calculations when estimate changes
  useEffect(() => {
    if (!isDragging && !isTogglingType) {
      const newRightValue = calculateRightValue(queryCount, measurementType, estimate, selectedEquivalent);
      setRightSideValue(newRightValue);
    }
  }, [estimate, measurementType, selectedEquivalent, queryCount, isDragging]);

  const startDragging = (side, initialValue, e) => {
    if (e.button !== 0) return; // Left click only
    e.preventDefault();
    setIsDragging(side);
    setLastDraggedSide(side); // Update last dragged side when starting to drag
    dragStartXRef.current = e.clientX;
    dragStartValueRef.current = initialValue;
    dragStartQueryCountRef.current = queryCount;
    lastIncrementRef.current = 0;
  };

  // Also update the manual input handlers to use whole numbers
  const handleLeftValueChange = (value) => {
    const newValue = Math.max(1, Math.round(value));
    setQueryCount(newValue);
    const newRightValue = calculateRightValue(newValue, measurementType, estimate, selectedEquivalent);
    setRightSideValue(Math.round(newRightValue * 100) / 100);
  };

  const handleRightValueChange = (value) => {
    const newValue = Math.max(1, Math.round(value * 100) / 100);
    setRightSideValue(newValue);
    // Always round the query count since left side is always whole numbers
    setQueryCount(Math.round(calculateLeftValue(newValue, measurementType, estimate, selectedEquivalent)));
  };

  // Toggle between energy and water
  const toggleMeasurementType = () => {
    setIsTogglingType(true);
    const newType = measurementType === 'energy' ? 'water' : 'energy';
    const defaultEquivalent = newType === 'energy' ? 'tv' : 'burger';

    // First update the state that affects calculations
    setMeasurementType(newType);
    setSelectedEquivalent(defaultEquivalent);

    // Calculate the query count needed for exactly 1 unit
    const modelUsage = newType === 'energy' 
      ? MODEL_ENERGY_PER_QUERY[estimate]
      : MODEL_WATER_PER_QUERY[estimate];
    const equivalentValue = lifestyleEquivalents[newType][defaultEquivalent].value;
    
    // Calculate exact query count needed for 1 unit
    const exactQueryCount = Math.round(equivalentValue / modelUsage);
    
    // Update state with exact values
    setQueryCount(exactQueryCount);
    setRightSideValue(1);

    // Reset the toggling flag after a short delay
    setTimeout(() => {
      setIsTogglingType(false);
    }, 100);
  };

  // Cycle through estimate modes: neutral -> optimistic -> pessimistic -> neutral
  const cycleEstimate = () => {
    const modes = ['neutral', 'optimistic', 'pessimistic'];
    const currentIndex = modes.indexOf(estimate);
    const nextIndex = (currentIndex + 1) % modes.length;
    setEstimate(modes[nextIndex]);
  };

  // Get the current equivalents based on measurement type
  const currentEquivalents = lifestyleEquivalents[measurementType];

  // Initialize right side value
  useEffect(() => {
    const initialRightValue = 1; // We want exactly 1 burger
    setRightSideValue(initialRightValue);
    const initialQueryCount = Math.round(calculateLeftValue(initialRightValue, 'water', 'neutral', 'burger'));
    setQueryCount(initialQueryCount);
  }, []);

  // Get the current unit text based on measurement type and estimate
  const getCurrentUnitText = (type, est) => {
    if (type === 'energy') {
      const kilowattHours = MODEL_ENERGY_PER_QUERY[est];
      // Format to at most 6 decimal places and remove trailing zeros
      const formattedKilowattHours = parseFloat(kilowattHours.toFixed(6));
      return `${formattedKilowattHours} kWh per query`;
    } else {
      const gallons = MODEL_WATER_PER_QUERY[est];
      // Format to at most 3 decimal places and remove trailing zeros
      const formattedGallons = parseFloat(gallons.toFixed(3));
      return `${formattedGallons} gallons per query`;
    }
  };

  return (
    <div className="converter-container">
      <h2 className="converter-title">AI usage converter</h2>
      
      <div className="measurement-toggles">
        <button 
          onClick={toggleMeasurementType}
          className="emoji-button"
          title={measurementType === 'energy' ? 'Switch to Water Usage' : 'Switch to Energy Usage'}
        >
          {TYPE_EMOJIS[measurementType]}
        </button>

        <button 
          className="emoji-button info-button"
          onClick={() => setIsModalOpen(true)}
        >
          ℹ️
        </button>

        <button 
          onClick={cycleEstimate}
          className="emoji-button"
          title={`Current: ${estimate} estimate`}
        >
          {ESTIMATE_EMOJIS[estimate]}
        </button>
      </div>

      <div className="mode-status">
        {measurementType.charAt(0).toUpperCase() + measurementType.slice(1)} / {estimate.charAt(0).toUpperCase() + estimate.slice(1)}
      </div>

      <div className="converter-body">
        <div className="side">
          <div className="emoji-box">
            {aiModels.chatgpt.emoji}
          </div>
          <div className="quantity">
            {isEditingLeft ? (
              <input
                type="number"
                value={queryCount}
                onChange={(e) => handleLeftValueChange(parseFloat(e.target.value) || 0)}
                onBlur={() => setIsEditingLeft(false)}
                onKeyDown={(e) => e.key === 'Enter' && setIsEditingLeft(false)}
                autoFocus
                className="editable-number"
                min="1"
                step="1"
              />
            ) : (
              <span 
                className={`editable-text ${isDragging === 'left' ? 'dragging' : ''}`}
                onClick={() => setIsEditingLeft(true)}
                onMouseDown={(e) => startDragging('left', queryCount, e)}
              >
                {formatNumber(queryCount, 'left')}
              </span>
            )} {getUnitText(queryCount, 'queries')}
          </div>
          <div className="unit-text">
            {getCurrentUnitText(measurementType, estimate)}
          </div>
          <div className="selector-container">
            <select 
              disabled
              className="dark-select disabled"
              title="More models coming soon!"
            >
              <option value="chatgpt">
                {aiModels.chatgpt.emoji} {aiModels.chatgpt.name}
              </option>
            </select>
          </div>
        </div>

        <div className="equals-sign">=</div>

        <div className="side">
          <div className="emoji-box">
            {currentEquivalents[selectedEquivalent].emoji}
          </div>
          <div className="quantity">
            {isEditingRight ? (
              <input
                type="number"
                value={Math.round(rightSideValue * 100) / 100}
                onChange={(e) => handleRightValueChange(parseFloat(e.target.value) || 0)}
                onBlur={() => setIsEditingRight(false)}
                onKeyDown={(e) => e.key === 'Enter' && setIsEditingRight(false)}
                autoFocus
                className="editable-number"
                min="1"
                step="1"
              />
            ) : (
              <span 
                className={`editable-text ${isDragging === 'right' ? 'dragging' : ''}`}
                onClick={() => setIsEditingRight(true)}
                onMouseDown={(e) => startDragging('right', rightSideValue, e)}
              >
                {console.log('rightSideValue before format:', rightSideValue)}
                {formatNumber(rightSideValue, 'right')}
              </span>
            )} {getUnitText(rightSideValue, currentEquivalents[selectedEquivalent].unit)}
          </div>
          <div className="unit-text">
            {currentEquivalents[selectedEquivalent].value} {measurementType === 'energy' ? 'kWh' : 'gallons'} per {currentEquivalents[selectedEquivalent].unit.singular}
          </div>
          <div className="selector-container">
            <select 
              value={selectedEquivalent} 
              onChange={(e) => setSelectedEquivalent(e.target.value)}
              className="dark-select"
            >
              {Object.entries(currentEquivalents).map(([key, item]) => (
                <option key={key} value={key}>
                  {item.emoji} {item.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="percentage-footer">
        <p>
          This amounts to {calculatePercentage(queryCount, measurementType, estimate, selectedEquivalent)}% of the average US household's daily {measurementType} use ({measurementType === 'energy' ? `${DAILY_HOUSEHOLD_ENERGY} kWh` : `${DAILY_HOUSEHOLD_WATER.toLocaleString()} gallons`}).
        </p>
        <p className="usage-fact">
          {measurementType === 'energy' 
            ? "Air conditioning, heating, and lighting account for over 50%."
            : "The shower, toilet, and faucet account for around 60%."}
        </p>
      </div>

      <InfoModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default EnergyConverter; 