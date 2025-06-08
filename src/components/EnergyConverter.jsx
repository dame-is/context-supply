import { useState, useRef, useEffect } from 'react';
import { lifestyleEquivalents, aiModels } from '../data/energyData';
import './EnergyConverter.css';

const EnergyConverter = () => {
  // Constants for daily household usage
  const DAILY_HOUSEHOLD_ENERGY = 30; // kWh (10,950 kWh/year ÷ 365 days)
  const DAILY_HOUSEHOLD_WATER = 300; // Gallons per day

  // Helper function to handle singular/plural units
  const getUnitText = (value, unit) => {
    // Round the value to 2 decimal places for comparison
    const roundedValue = Math.round(value * 100) / 100;
    
    // Handle the case where unit is a string (like "Queries")
    if (typeof unit === 'string') {
      if (unit === 'queries') {
        return roundedValue === 1 ? 'query' : 'queries';
      }
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
    
    // For exact values (like when toggling), return exactly 1
    if (leftValue === Math.round(equivalent.value / modelUsage)) {
      return 1;
    }
    
    const result = (modelUsage * leftValue) / equivalent.value;
    console.log('calculateRightValue:', {
      leftValue,
      type,
      est,
      equiv,
      modelUsage,
      equivalentValue: equivalent.value,
      result
    });
    return result;
  };

  // Calculate the left side value based on right side value (no rounding)
  const calculateLeftValue = (rightValue, type, est, equiv) => {
    const modelUsage = type === 'energy' 
      ? MODEL_ENERGY_PER_QUERY[est]
      : MODEL_WATER_PER_QUERY[est];
    const equivalent = lifestyleEquivalents[type][equiv];
    
    const result = (rightValue * equivalent.value) / modelUsage;
    console.log('calculateLeftValue:', {
      rightValue,
      type,
      est,
      equiv,
      modelUsage,
      equivalentValue: equivalent.value,
      result
    });
    return result;
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
  const [isSelectingRight, setIsSelectingRight] = useState(false);
  const [showAiComingSoon, setShowAiComingSoon] = useState(false);
  const rightSideRef = useRef(null);
  const leftSideRef = useRef(null);
  const [editingLeftValue, setEditingLeftValue] = useState('');
  const [editingRightValue, setEditingRightValue] = useState('');

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
    if (!isDragging) {
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
  const handleLeftValueChange = (e) => {
    const inputValue = e.target.value;
    setEditingLeftValue(inputValue);
  };

  const handleRightValueChange = (e) => {
    const inputValue = e.target.value;
    setEditingRightValue(inputValue);
  };

  const handleLeftValueComplete = () => {
    let newValue = parseFloat(editingLeftValue);
    if (isNaN(newValue) || newValue < 0) newValue = 0;
    newValue = Math.round(newValue); // Ensure whole numbers for left side
    setQueryCount(newValue);
    const newRightValue = calculateRightValue(newValue, measurementType, estimate, selectedEquivalent);
    setRightSideValue(Math.round(newRightValue * 100) / 100);
    setIsEditingLeft(false);
    setEditingLeftValue('');
  };

  const handleRightValueComplete = () => {
    let newValue = parseFloat(editingRightValue);
    if (isNaN(newValue) || newValue < 0) newValue = 0;
    newValue = Math.round(newValue * 100) / 100; // Allow decimals for right side
    setRightSideValue(newValue);
    setQueryCount(Math.round(calculateLeftValue(newValue, measurementType, estimate, selectedEquivalent)));
    setIsEditingRight(false);
    setEditingRightValue('');
  };

  // Toggle between energy and water
  const toggleMeasurementType = () => {
    const newType = measurementType === 'energy' ? 'water' : 'energy';
    const defaultEquivalent = newType === 'energy' ? 'tv' : 'burger';
    
    console.log('toggleMeasurementType - start:', {
      newType,
      defaultEquivalent,
      estimate
    });

    // First update the state that affects calculations
    setMeasurementType(newType);
    setSelectedEquivalent(defaultEquivalent);

    // Calculate the query count needed for exactly 1 unit
    const modelUsage = newType === 'energy' 
      ? MODEL_ENERGY_PER_QUERY[estimate]
      : MODEL_WATER_PER_QUERY[estimate];
    const equivalentValue = lifestyleEquivalents[newType][defaultEquivalent].value;
    
    // Calculate exact query count needed for 1 unit and ensure it results in exactly 1 unit
    const exactQueryCount = equivalentValue / modelUsage;
    const roundedQueryCount = Math.round(exactQueryCount);
    
    console.log('toggleMeasurementType - calculations:', {
      modelUsage,
      equivalentValue,
      exactQueryCount,
      roundedQueryCount,
      resultingRightValue: (modelUsage * roundedQueryCount) / equivalentValue
    });

    // Update state with values that will give us exactly 1 unit
    setQueryCount(roundedQueryCount);
    setRightSideValue(1);
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

  // Handle clicking outside the popups
  useEffect(() => {
    if (!isSelectingRight && !showAiComingSoon) return;

    const handleClickOutside = (event) => {
      if (isSelectingRight && rightSideRef.current && !rightSideRef.current.contains(event.target)) {
        setIsSelectingRight(false);
      }
      if (showAiComingSoon && leftSideRef.current && !leftSideRef.current.contains(event.target)) {
        setShowAiComingSoon(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSelectingRight, showAiComingSoon]);

  // Handle clicking on the left emoji box (AI model)
  const handleLeftEmojiClick = () => {
    setShowAiComingSoon(!showAiComingSoon);
  };

  // Handle clicking on the right emoji box (equivalent)
  const handleRightEmojiClick = () => {
    setIsSelectingRight(!isSelectingRight);
  };

  // Handle selecting a new equivalent
  const handleEquivalentSelect = (newEquivalent) => {
    setSelectedEquivalent(newEquivalent);
    setIsSelectingRight(false);
  };

  return (
    <div className="converter-container">
      <h2 className="converter-title">AI Water & Energy Converter</h2>
      
      <div className="controls-section">
        <div className="measurement-toggles">
          <button 
            onClick={toggleMeasurementType}
            className="emoji-button"
            title={measurementType === 'energy' ? 'Switch to Water Usage' : 'Switch to Energy Usage'}
          >
            {TYPE_EMOJIS[measurementType]}
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
      </div>

      <div className="converter-body">
        <div className="side" ref={leftSideRef}>
          <div 
            className={`emoji-box ${showAiComingSoon ? 'active' : ''}`}
            onClick={handleLeftEmojiClick}
            title="More models coming soon!"
          >
            {aiModels.chatgpt.emoji}
          </div>
          <div className="quantity">
            {isEditingLeft ? (
              <input
                type="number"
                value={editingLeftValue}
                onChange={handleLeftValueChange}
                onBlur={handleLeftValueComplete}
                onKeyDown={(e) => e.key === 'Enter' && handleLeftValueComplete()}
                autoFocus
                className="editable-number"
                min="0"
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
            )}
            <span className="unit-text">{getUnitText(queryCount, 'queries')}</span>
          </div>
          <div className="unit-text">
            {getCurrentUnitText(measurementType, estimate)}
          </div>
          {showAiComingSoon && (
            <div className="coming-soon-popup">
              Based on ChatGPT... more models will be added as data becomes available!
            </div>
          )}
        </div>

        <div className="equals-sign">=</div>

        <div className="side" ref={rightSideRef}>
          <div 
            className={`emoji-box ${isSelectingRight ? 'active' : ''}`}
            onClick={handleRightEmojiClick}
            title="Click to change equivalent"
          >
            {currentEquivalents[selectedEquivalent].emoji}
          </div>
          <div className="quantity">
            {isEditingRight ? (
              <input
                type="number"
                value={editingRightValue}
                onChange={handleRightValueChange}
                onBlur={handleRightValueComplete}
                onKeyDown={(e) => e.key === 'Enter' && handleRightValueComplete()}
                autoFocus
                className="editable-number"
                min="0"
                step="0.01"
              />
            ) : (
              <span 
                className={`editable-text ${isDragging === 'right' ? 'dragging' : ''}`}
                onClick={() => setIsEditingRight(true)}
                onMouseDown={(e) => startDragging('right', rightSideValue, e)}
              >
                {formatNumber(rightSideValue, 'right')}
              </span>
            )}
            <span className="unit-text">{getUnitText(rightSideValue, currentEquivalents[selectedEquivalent].unit)}</span>
          </div>
          <div className="unit-text">
            {currentEquivalents[selectedEquivalent].value} {measurementType === 'energy' ? 'kWh' : 'gallons'} per {currentEquivalents[selectedEquivalent].unit.singular}
          </div>
          {isSelectingRight && (
            <div className="equivalent-options">
              {Object.entries(currentEquivalents).map(([key, item]) => (
                <button
                  key={key}
                  className={`emoji-button ${key === selectedEquivalent ? 'active' : ''}`}
                  onClick={() => handleEquivalentSelect(key)}
                  title={item.name}
                >
                  {item.emoji}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="percentage-footer">
        <p>
          This amounts to {calculatePercentage(queryCount, measurementType, estimate, selectedEquivalent)}% of the average US household's daily {measurementType} use ({measurementType === 'energy' ? `${DAILY_HOUSEHOLD_ENERGY} kWh` : `${DAILY_HOUSEHOLD_WATER.toLocaleString()} gallons`}).
        </p>
        <p>
          {measurementType === 'energy' 
            ? "Air conditioning, heating, and lighting account for over 50%."
            : "The shower, toilet, and faucet account for around 60%."}
        </p>
      </div>
    </div>
  );
};

export default EnergyConverter; 