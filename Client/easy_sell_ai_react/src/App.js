import React, { useState, useEffect } from 'react';
import './App.css';
import calendarIcon from './images/calendar-icon.png';
import profileIcon from './images/profile-icon.png';
import chatIcon from './images/chat-icon.png';
import minimizeIcon from './images/minimize-icon.png';
import infoIcon from './images/info-icon.png';
import ToggleSwitch from "./components/ToggleSwitch";


function setStorage(data) {
  window.postMessage({ type: "FROM_PAGE", command: "setStorage", data }, "*");
}

function getStorage(keys) {
  return new Promise((resolve, reject) => {
    window.postMessage({ type: "FROM_PAGE", command: "getStorage", keys }, "*");

    function handleGetStorage(event) {
      try {
        if (event.source !== window) return;
        if (event.data.type && event.data.type === "FROM_EXTENSION" && event.data.command === "getStorageResult") {
          resolve(event.data.data);
          // Remove the event listener after it is called
          window.removeEventListener('message', handleGetStorage);
        }
      } catch (error) {
        // If there's an error, reject the Promise
        reject(error);
      }
    }

    window.addEventListener("message", handleGetStorage);
  });
}


function ChatPanel() {
  // Initialize state
  const [negotiationStyle, setNegotiationStyle] = useState('Optimized');
  const [followUpHours, setFollowUpHours] = useState(0);
  const [meetingPlace, setMeetingPlace] = useState('');
  const [priceMargin, setPriceMargin] = useState(0);

  // Update state with values from chromeAPI.storage.sync when component mounts
  useEffect(() => {
    const loadStorageData = async () => {
      const result = await getStorage(['negotiationStyle', 'followUpDays', 'followUpHours', 'meetingPlace', 'priceMargin']);
      if (result.negotiationStyle) setNegotiationStyle(result.negotiationStyle);
      if (result.followUpHours) setFollowUpHours(result.followUpHours);
      if (result.meetingPlace) setMeetingPlace(result.meetingPlace);
      if (result.priceMargin) setPriceMargin(result.priceMargin);
    };
    
    loadStorageData();
  }, []);

  // Update chromeAPI.storage.sync whenever state changes
  useEffect(() => {
    setStorage({
      'negotiationStyle': negotiationStyle,
      'followUpHours': followUpHours,
      'meetingPlace': meetingPlace,
      'priceMargin': priceMargin
    });
  }, [negotiationStyle, followUpHours, meetingPlace, priceMargin]);

  return (
    <div className="chatPanel">
      <div className="inputGroup">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <label className="label1">Negotiation Style</label>
          <div className ="tooltip">
            <img className="infoIcon" src={infoIcon} alt="info" />
            <span className="tooltiptext">Configures the AI's negotiation style</span>
          </div>
        </div>
        
        <select
          className="dropdown"
          value={negotiationStyle}
          onChange={e => setNegotiationStyle(e.target.value)}
        >
          <option value="Optimized">Optimized</option>
          <option value="Aggressive">Aggressive</option>
          <option value="Respectful">Respectful</option>
        </select>
      </div>

      <div className="inputGroup">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <label className="label1">Follow Up After</label>
          <div className="tooltip">
            <img className="infoIcon" src={infoIcon} alt="info" />
            <span className="tooltiptext">Specifies the number of hours to wait before following up with the buyer</span>
          </div>
        </div>
        
        <div className="inputWithLabel">
          <input 
            type="number" 
            min="0" 
            max="336" 
            className="textInput" 
            value={followUpHours} 
            onChange={e => {
              const value = e.target.value;
              if (value > 336) {
                alert("Maximum value is 336");
                setFollowUpHours(336);
              } else {
                setFollowUpHours(value);
              }
            }} 
          />
          <span>Hours</span>
        </div>
      </div>

      <div className="inputGroup">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <label className="label1">Preferred Meeting Place:</label>
          <div className="tooltip">
            <img className="infoIcon" src={infoIcon} alt="info" />
            <span className="tooltiptext">Specifies your preferred meeting place for transactions in a natural language format. e.g., "123 Sesame Street" or "The Grove Mall".</span>
          </div>
        </div>
        
        <input type="text" className="textInput" value={meetingPlace} onChange={e => setMeetingPlace(e.target.value)} />
      </div>

      <div className="inputGroup">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <label className="label1">Margin of Error for Price:</label>
          <div className="tooltip">
            <img className="infoIcon" src={infoIcon} alt="info" />
            <span className="tooltiptext">Specifies the acceptable percent difference you are willing to accept from the listing price. e.g, if your margin of error is 10% and your item is $100, the lowest price the AI will accept is $90.</span>
          </div>
        </div>

        <div className="inputWithLabel">
          <input 
            type="number" 
            min="0" 
            max="100" 
            className="textInput" 
            value={priceMargin} 
            onChange={e => {
              const value = e.target.value;
              if (value > 100) {
                alert("Maximum value is 100");
                setPriceMargin(100);
              } else {
                setPriceMargin(value);
              }
            }} 
          />
          <span>%</span>
        </div>
      </div>

    </div>
  );
}

function CalendarPanel() {
  const [dateInputs, setDateInputs] = useState(['', '', '']);
  const [timeZone, setTimeZone] = useState('-5');

  // Update state with values from chromeAPI.storage.sync when component mounts
  useEffect(() => {
    const loadStorageData = async () => {
      const result = await getStorage(['dateInputs', 'timeZone']);
      if (result.dateInputs) setDateInputs(result.dateInputs);
      if (result.timeZone) setTimeZone(result.timeZone);
    };
    
    loadStorageData();
  }, []);

  useEffect(() => {
    setStorage({'dateInputs': dateInputs, 'timeZone': timeZone});
  }, [dateInputs, timeZone]);

  const handleDateInputChange = (index, event) => {
    const newDateInputs = [...dateInputs];
    newDateInputs[index] = event.target.value;
    setDateInputs(newDateInputs);
  };

  const timeZones = [
    { label: 'Eastern Standard Time (UTC-5)', value: '-5' },
    { label: 'Pacific Standard Time (UTC-8)', value: '-8' },
    { label: 'Mountain Standard Time (UTC-7)', value: '-7' },
    { label: 'Central Standard Time (UTC-6)', value: '-6' },
    { label: 'International Date Line West (UTC-12)', value: '-12' },
    { label: 'Samoa Standard Time (UTC-11)', value: '-11' },
    { label: 'Hawaii Standard Time (UTC-10)', value: '-10' },
    { label: 'Alaska Standard Time (UTC-9)', value: '-9' },
    { label: 'Atlantic Standard Time (UTC-4)', value: '-4' },
    { label: 'Argentina Standard Time (UTC-3)', value: '-3' },
    { label: 'Greenland Standard Time (UTC-3)', value: '-3' },
    { label: 'Mid-Atlantic Standard Time (UTC-2)', value: '-2' },
    { label: 'Azores Standard Time (UTC-1)', value: '-1' },
    { label: 'Greenwich Mean Time (UTC)', value: '0' },
    { label: 'Central European Time (UTC+1)', value: '1' },
    { label: 'Eastern European Time (UTC+2)', value: '2' },
    { label: 'Moscow Standard Time (UTC+3)', value: '3' },
    { label: 'Iran Standard Time (UTC+3:30)', value: '3.5' },
    { label: 'Arabian Standard Time (UTC+4)', value: '4' },
    { label: 'Afghanistan Time (UTC+4:30)', value: '4.5' },
    { label: 'Pakistan Standard Time (UTC+5)', value: '5' },
    { label: 'Bangladesh Standard Time (UTC+6)', value: '6' },
    { label: 'Indochina Time (UTC+7)', value: '7' },
    { label: 'China Standard Time (UTC+8)', value: '8' },
    { label: 'Australian Western Standard Time (UTC+8)', value: '8' },
    { label: 'Japan Standard Time (UTC+9)', value: '9' },
    { label: 'Australian Eastern Standard Time (UTC+10)', value: '10' },
    { label: 'New Zealand Standard Time (UTC+12)', value: '12' },
    { label: 'Baker Island Time (UTC-12)', value: '-12' }
  ];
  
  return (
    <div className="calendarPanel">
      <div className="inputGroup">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <label className="label1">Enter a Date or Dates When You're Available</label>
          <div className="tooltipLeft">
            <img className="infoIcon" src={infoIcon} alt="info" />
            <span className="tooltiptext">Use natural language to specify the dates you're available for meetups. This can be vague as "Weekdays from 6:00PM to 9:00PM" or as specific as "August 25th at 9:00AM". Make sure to fill in at least one field.</span>
          </div>
        </div>
        
        {dateInputs.map((dateInput, index) => (
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
            <div>{index + 1}.</div>
            <input
              key={index}
              type="text"
              className="textInput"
              maxLength={50}
              value={dateInput}
              onChange={(event) => handleDateInputChange(index, event)}
              style={{ marginLeft: '10px' }}
            />
          </div>
        ))}
      </div>
      <div className="inputGroup">
        <label className="label1">Select Your Current Time Zone</label>
        <select
          className="dropdown"
          value={timeZone}
          onChange={e => setTimeZone(e.target.value)}
        >
          {timeZones.map((zone, index) => (
            <option key={index} value={zone.value}>{zone.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

function AccountPanel() {
  const [accessKey, setAccessKey] = useState('');
  const [isKeyValid, setIsKeyValid] = useState(false);
  const [isEditing, setIsEditing] = useState(true);
  const [expiryTime, setExpiryTime] = useState(null);
  const [buttonLabel, setButtonLabel] = useState('Submit');

  useEffect(() => {
    const loadInitialData = async () => {
      const result = await getStorage(['accessKey', 'isKeyValid', 'isEditing', 'expiryTime']);
      if(result.accessKey) setAccessKey(result.accessKey);
      if(result.isKeyValid !== undefined) setIsKeyValid(result.isKeyValid);
      if(result.isEditing !== undefined) setIsEditing(result.isEditing);
      if(result.expiryTime) setExpiryTime(result.expiryTime);
    };
    
    loadInitialData();
  }, []);

  useEffect(() => {
    if (isKeyValid && !isEditing) {
      setButtonLabel('Edit');
    } else {
      setButtonLabel('Submit');
    }
  }, [isKeyValid, isEditing]);

  useEffect(() => {
    const loadData = async () => {
      const result = await getStorage(['accessKey', 'isKeyValid', 'isEditing', 'expiryTime']);
      if (result.accessKey) setAccessKey(result.accessKey);
      if (result.isKeyValid) setIsKeyValid(result.isKeyValid);
      if (result.isEditing) setIsEditing(result.isEditing);
      if (result.expiryTime) setExpiryTime(result.expiryTime);
    };
  
    loadData();
  }, []);  

  useEffect(() => {
    setStorage({'accessKey': accessKey, 'isKeyValid': isKeyValid, 'isEditing': isEditing, 'expiryTime': expiryTime});
  }, [accessKey, isKeyValid, isEditing, expiryTime]);

  useEffect(() => {
    // Define a function to handle the 'accessKeyValidated' event
    const handleAccessKeyValidated = (event) => {
      const { success, expiry_time } = event.detail;
      if (success) {
        // The access key is valid, allow user to use the extension
        // console.log('Access key is valid');
        setIsKeyValid(true);
        setIsEditing(false);
        setExpiryTime(expiry_time);  // Update the expiry time
        setStorage({ 'expiryTime': expiry_time, 'isKeyValid': true, 'isEditing': false });
        // Dispatch a 'keyValidityChanged' event with the new validity as detail
        const event = new CustomEvent('keyValidityChanged', { detail: { isValid: true } });
        window.dispatchEvent(event);
      } else {
        // The access key is not valid, show an error message
        // console.log('Access key is not valid');
        setIsKeyValid(false);
        setIsEditing(true);
        setStorage({ 'isKeyValid': false, 'isEditing': true });
        const event = new CustomEvent('keyValidityChanged', { detail: { isValid: false } });
        window.dispatchEvent(event);
      }
    };

    // Add the event listener
    window.addEventListener('accessKeyValidated', handleAccessKeyValidated);

    // Clean up by removing the event listener when the component unmounts
    return () => {
      window.removeEventListener('accessKeyValidated', handleAccessKeyValidated);
    };
  }, []);

  const handleSubmit = () => {
    if (isKeyValid && !isEditing) {
      // If the key is valid and the user isn't currently editing, allow the user to edit it
      setIsKeyValid(false);
      setIsEditing(true);
      setStorage({ 'isKeyValid': false, 'isEditing': true });
      const event = new CustomEvent('keyValidityChanged', { detail: { isValid: false } });
      window.dispatchEvent(event);
    } else {
      // Dispatch a 'validateAccessKey' event with the access key as detail
      const event = new CustomEvent('validateAccessKey', { detail: { accessKey } });
      window.dispatchEvent(event);
    }
  };

  return (
    <div className="accountPanel">
      <div className="inputGroup">
        <label className="label1">Enter Your Access Key</label>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <input 
            type="text" 
            className="textInput" 
            value={accessKey} 
            onChange={e => setAccessKey(e.target.value)} 
            readOnly={!isEditing}
          />
          <button 
            type="submit"
            className="button"
            onClick={handleSubmit}
          >
            {buttonLabel}
          </button>
        </div>
        {expiryTime && !isEditing && <button className="button" disabled>Expires {expiryTime}</button>}
      </div>
    </div>
  );
}

function App() {
  // console.log('Rendering App');
  const [isRunning, setIsRunning] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [openPanel, setOpenPanel] = useState('account');
  const [toggleSwitchState, setToggleSwitchState] = useState(false); // State for the toggle switch
  const [isKeyValid, setIsKeyValid] = useState(false);
  const [updated, setUpdated] = useState(null);

  useEffect(() => {
    // Define a function to handle the event
    const handleUpdated = (event) => {
      setUpdated(event.detail);
    };
  
    // Add an event listener for the 'updated' event
    window.addEventListener('updated', handleUpdated);
  
    // Remove the event listener when the component is unmounted
    return () => {
      window.removeEventListener('updated', handleUpdated);
    };
  }, []);  

  useEffect(() => {
    // console.log('Running useEffect for initializing state');
    const loadData = async () => {
      const result = await getStorage(['isRunning', 'openPanel', 'isKeyValid', 'toggleSwitchState']);
      // console.log('getStorage result:', result);
      if(result.isRunning) setIsRunning(result.isRunning);
      if(result.openPanel) setOpenPanel(result.openPanel);
      if(result.isKeyValid) setIsKeyValid(result.isKeyValid);
      if(result.toggleSwitchState) setToggleSwitchState(result.toggleSwitchState);
    };
  
    loadData();
  }, []);  

  // Save the state to chromeAPI storage whenever it changes
  useEffect(() => {
    setStorage({'isRunning': isRunning, 'openPanel': openPanel, 'isKeyValid': isKeyValid, 'toggleSwitchState': toggleSwitchState});
  }, [isRunning, openPanel, isKeyValid, toggleSwitchState]);

  useEffect(() => {
    // Add a log message at the start of the effect
    // console.log('Running toggleSwitchState useEffect', toggleSwitchState);

    // Dispatch a 'toggleSwitchStateChanged' event with the new state as detail
    const event = new CustomEvent('toggleSwitchStateChanged', { detail: { isOn: toggleSwitchState } });
    window.dispatchEvent(event);
  }, [toggleSwitchState]);  // This effect runs whenever toggleSwitchState changes

  
  const handleToggle = async () => { // Note the async keyword here
    // console.log('Switch toggled');
    // console.trace();
  
    // Await the getStorage function and assign the result to a variable
    const result = await getStorage(['accessKey', 'isKeyValid', 'negotiationStyle', 'followUpHours', 'meetingPlace', 'priceMargin', 'timeZone', 'dateInputs']);
  
    // console.log('Inside getStorage callback');
    // console.trace();
  
    // Check if the result is undefined
    if (!result) {
        // console.log('getStorage result is undefined');
        alert("Please fill out all fields and use a valid access key before turning on the switch");
        return;
    }
  
    // console.log('Got result from storage in handleToggle', result);
  
    // Perform your validation
    if (
      !result.accessKey || 
      result.isKeyValid !== true || 
      !result.negotiationStyle || 
      !result.followUpHours || 
      !result.meetingPlace || 
      !result.priceMargin || 
      !result.timeZone ||
      (!Array.isArray(result.dateInputs) || result.dateInputs.length !== 3 || !result.dateInputs.some(item => item !== ''))  // Add this line to check for dateInputs
    ) {
      // console.log('Validation failed in handleToggle');
      alert("Please fill out all fields before turning on the switch");
      return;  // Do not change the switch state
    }

    // console.log('Validation passed in handleToggle');
    setToggleSwitchState(!toggleSwitchState);
  };  

  useEffect(() => {
    // Define a function to handle the 'keyValidityChanged' event
    const handleKeyValidityChanged = (event) => {
      const { isValid } = event.detail;
      setIsKeyValid(isValid);
      setStorage({'isKeyValid': isValid}); // Save the new validity state
    };
  
    // Add the event listener
    window.addEventListener('keyValidityChanged', handleKeyValidityChanged);
  
    // Clean up by removing the event listener when the component unmounts
    return () => {
      window.removeEventListener('keyValidityChanged', handleKeyValidityChanged);
    };
  }, []);  

  const handleMinimizeClick = () => {
    // console.log('Minimize button clicked');
    setIsSidebarVisible(false);  // Hide the sidebar

    // Create a new event with the 'sidebarVisibilityChanged' type and the new visibility as detail
    const event = new CustomEvent('sidebarVisibilityChanged', { detail: { isVisible: false } });
    setToggleSwitchState(false);
    // Dispatch the event
    window.dispatchEvent(event);
  };

  useEffect(() => {
    // Define a function to handle the 'toggleSidebar' event
    const handleToggleSidebar = () => {
        setIsSidebarVisible(true);
    };

    // Add the event listener
    window.addEventListener('toggleSidebar', handleToggleSidebar);

    // Clean up by removing the event listener when the component unmounts
    return () => {
        window.removeEventListener('toggleSidebar', handleToggleSidebar);
    };
  }, []);

  function handleToggleSwitchState(event) {
    const { isOn } = event.detail;
    setToggleSwitchState(isOn);
  }
  
  window.addEventListener('changeSwitchState', handleToggleSwitchState);

  // console.log(updated);
  return (
    isSidebarVisible && (
      <div className="sidebar">
        <div className="beta">Beta 0.1.0</div>
        <div className="title">EasySell.ai</div>
        <div className="toggleAndAuth">
          <ToggleSwitch 
            label=" "
            checked={toggleSwitchState} 
            onClick={(event) => {
              // console.log('ToggleSwitch onClick triggered');  // Add a console log here
              // Only run handleToggle if the event was caused by a user action
              if (event.isTrusted) {
                // console.log('Event is trusted, calling handleToggle');  // And here
                handleToggle();
              } else {
                // console.log('Event is not trusted, not calling handleToggle');  // And here
              }
            }}
          />
          {!isKeyValid && <div className="authorizationStatus" disabled>Not Authorized</div>}
        </div>
        <button className="minimizeButton" onClick={handleMinimizeClick}>
          <img className="tabIcon" src={minimizeIcon} alt="Minimize Icon" />
        </button>
      
        {isRunning && <span className="status">(running)</span>}
        <button className="feedbackButton" onClick={() => window.open('https://easysell.ai/contact', '_blank')}>
            Give us feedback
        </button>
        { updated === false && <div className="updateMessage">A new update is available. <a href="https://drive.google.com/drive/u/1/folders/1ICQ5uV8d44oGuxuhuySwGMHmqjVZi7O1" target="_blank">Please click here to download it.</a></div> }
        <div className="tabs">
          <button className={`tabButton ${openPanel === 'chat' ? 'active' : ''}`} onClick={() => setOpenPanel('chat')}>
            <img className="tabIcon" src={chatIcon} alt="Chat Icon" />
          </button>
          <button className={`tabButton ${openPanel === 'calendar' ? 'active' : ''}`} onClick={() => setOpenPanel('calendar')}>
            <img className="tabIcon" src={calendarIcon} alt="Calendar Icon" />
          </button>
          <button className={`tabButton ${openPanel === 'account' ? 'active' : ''}`} onClick={() => setOpenPanel('account')}>
            <img className="tabIcon" src={profileIcon} alt="Profile Icon" />
          </button>
        </div>
        {openPanel === 'chat' && <ChatPanel />}
        {openPanel === 'account' && <AccountPanel />}
        {openPanel === 'calendar' && <CalendarPanel />}
      </div>
    )
  );
}

export default App;