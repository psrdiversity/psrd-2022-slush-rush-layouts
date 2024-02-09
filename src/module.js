import React from 'react';

cartographer.register('run-info', ({ sidebar, leftAligned }) => {
  const [runDataActiveRun] = cartographer.useReplicant('runDataActiveRun', {}, {
    namespace: 'nodecg-speedcontrol',
  });

  const [flashingLights] = cartographer.useReplicant('flashingLights', false, {
    namespace: 'nodecg-speedrun-layout-options',
  });

  const [contentWarning] = cartographer.useReplicant('contentWarning', { enabled: false, details: '' }, {
    namespace: 'nodecg-speedrun-layout-options',
  });

  const allWarnings = cartographer.useMemo(() => {
    const contentWarnings = contentWarning.details.length === 0 ? ['sensitive content'] : contentWarning.details.split(',').map(item => item.trim());
    const warnings = [
      flashingLights ? 'flashing lights' : '',
      ...(contentWarning.enabled ? contentWarnings : []),
    ].filter(item => item.length > 0);

    if (warnings.length === 1) return warnings[0];
    if (warnings.length === 2) return warnings.join(' and ');

    return `${warnings.slice(0, warnings.length - 1).join(', ')}, and ${warnings[warnings.length - 1]}`;
  }, [contentWarning, flashingLights]);

  return (
    <div className={`run-info-${sidebar ? 'sidebar' : 'center'} ${leftAligned ? 'left-aligned' : ''}`}>
      <div className="info-block">
        <div className="info-block-backdrop" />
        <div className="run-data-container">
          <div>{runDataActiveRun.game}</div>
          {runDataActiveRun.system && runDataActiveRun.release && (
            <div className="run-info-metadata">
              {runDataActiveRun.system} ({runDataActiveRun.release})
            </div>
          )}
        </div>
      </div>
      <div className="info-block run-details">
        <div className="category-name">{runDataActiveRun.category}</div>
        <div className="estimate">{runDataActiveRun.estimate}</div>
      </div>
      {(flashingLights || contentWarning.enabled) && (
        <div className={`run-alert ${allWarnings.length > 33 ? 'marquee' : ''}`}>
          <div>
            <span>WARNING: Game contains {allWarnings}</span>
            <span>WARNING: Game contains {allWarnings}</span>
          </div>
        </div>
      )}
    </div>
  );
});

function isRunnerSpeaking(slotName, channelLevels, slotMappings) {
  const slotIndex = slotMappings[slotName];
  
  return slotIndex && (channelLevels[slotIndex]?.isActivated ?? false);
}


cartographer.register('runner', ({ team = 0, mixerSlotName }) => {
  const [runDataActiveRun] = cartographer.useReplicant('runDataActiveRun', null, {
    namespace: 'nodecg-speedcontrol',
  });

  const [channelLevels] = cartographer.useReplicant('channelLevels', [], { namespace: 'nodecg-xair-meter' });
  const [slotMappings] = cartographer.useReplicant('slotMappings', {}, { namespace: 'nodecg-xair-meter' });

  const isSpeaking = isRunnerSpeaking(mixerSlotName, channelLevels, slotMappings);

  if (!runDataActiveRun) return null;

  const runnerTeams = runDataActiveRun.teams.filter(team => (team.name || '').toLowerCase().indexOf('host') === -1);
  const runnerTeam = runnerTeams[team];

  if (!runnerTeam) return null;

  const runner = runnerTeam.players[0];

  return (
    <div className={`runner commentator-info ${isSpeaking ? 'speaking' : ''}`}>
     <div className="commentator-name">{runner.name}</div>
     {runner.pronouns && <div className="pronouns">{runner.pronouns}</div>}
    </div>
  );
});

function getLongNameFontSizeAdjustment(name, adjustNameSizes = true) {
  if (name.length <= 12 || !adjustNameSizes) return 'inherit';

  return `${0.75 - Math.floor((name.length - 11) / 2) * 0.05}rem`;
}

cartographer.register('commentators', ({ showLabel, adjustNameSizes = false }) => {
  const [runDataActiveRun] = cartographer.useReplicant('runDataActiveRun', null, {
    namespace: 'nodecg-speedcontrol',
  });

  const commentatorData = cartographer.useMemo(() => {
    if (!runDataActiveRun) return [];

    return [
      [runDataActiveRun.customData.commentator1Name, runDataActiveRun.customData.commentator1Pronouns],
      [runDataActiveRun.customData.commentator2Name, runDataActiveRun.customData.commentator2Pronouns],
      [runDataActiveRun.customData.commentator3Name, runDataActiveRun.customData.commentator3Pronouns],
      [runDataActiveRun.customData.commentator4Name, runDataActiveRun.customData.commentator4Pronouns],
    ].filter(([name]) => name !== undefined);
  }, [runDataActiveRun]);

  const [channelLevels] = cartographer.useReplicant('channelLevels', [], { namespace: 'nodecg-xair-meter' });
  const [slotMappings] = cartographer.useReplicant('slotMappings', {}, { namespace: 'nodecg-xair-meter' });

  const speakingStatuses = [1, 2, 3, 4].map(index => isRunnerSpeaking(`commentary${index}`, channelLevels, slotMappings));
  
  return (
    <>
      {showLabel && commentatorData.length > 0 && <div className="commentator-label">Commentators</div>}
      <div className={`commentator-list ${commentatorData.length === 1 ? 'one-commentator' : ''}`}>
        {commentatorData.map(([name, pronouns], index) => (
          <div key={index} className={`commentator-info ${speakingStatuses[index] ? 'speaking' : ''}`}>
            <div className="commentator-name" style={{ fontSize: getLongNameFontSizeAdjustment(name, adjustNameSizes) }}>{name}</div>
            {pronouns && <div className="pronouns">{pronouns}</div>}
          </div>
        ))}
      </div>
    </>
  );
});

cartographer.register('timer', () => {
  const [timer] = cartographer.useReplicant('timer', {}, {
    namespace: 'nodecg-speedcontrol',
  });

  return (
    <div className="timer">
      {timer.time}
    </div>
  );
});

cartographer.register('source-wrapper', ({ children }) => {
  return (
    <div className="psrd-source">
      {children}
    </div>
  );
});

cartographer.register('nameplate', ({ name = '', pronouns = '', subtitle = '' }) => {
  return (
    <div>
      <div className="runner commentator-info">
        <div className="commentator-name">{name}</div>
        {pronouns && <div className="pronouns">{pronouns}</div>}
      </div>
      {subtitle && <div className="interview-subtitle">{subtitle}</div>}
    </div>
  );
});

const DONATION_ANIMATE_TIME_MS = 500;

cartographer.register('donationTotal', () => {
  const [donationTotal] = cartographer.useReplicant('donationTotal', 0, {
    namespace: 'speedcontrol-gdqtracker'
  });

  const currentValue = cartographer.useRef(0);
  const displayedValueRef = cartographer.useRef(0);
  const [displayedValue, setDisplayedValue] = cartographer.useState(0);

  const animationIntervalId = cartographer.useRef(null);

  const animateTotal = cartographer.useCallback((value) => {
    if (animationIntervalId.current) clearInterval(animationIntervalId.current);

		const current = currentValue.current;

		const difference = value - current;
		const timeBeforeIncrement = Math.max(difference <= DONATION_ANIMATE_TIME_MS ? Math.floor(DONATION_ANIMATE_TIME_MS / difference) : 1, 10);
		const incrementAmount = timeBeforeIncrement === 10 ? Math.ceil(difference / DONATION_ANIMATE_TIME_MS) * 10 : 1;

		animationIntervalId.current = setInterval(() => {
			const nextValue = Math.min(value, displayedValueRef.current) + incrementAmount;

			if (nextValue >= value) {
        clearInterval(animationIntervalId.current);
        setDisplayedValue(value);
        displayedValueRef.current = value;
      } else {
        setDisplayedValue(nextValue);
        displayedValueRef.current = nextValue;
      }
		}, timeBeforeIncrement);
  }, []);

  cartographer.useEffect(() => {
    animateTotal(donationTotal);
  }, [donationTotal]);

  const displayedTotal = Math.floor(displayedValue).toLocaleString('en-US', { minimumFractionDigits: 0 });
  
  return (
    <div className="donation-total">
      <div className="donation-value">${displayedTotal}</div>
      <div className="donation-benefactor">raised for <span>EWAAB</span></div>
    </div>
  );
});

cartographer.register('eventTitle', () => (
  <div className="event-title-container">
    <div className="event-title">Slush Rush</div>
    <div className="event-subtitle">Presented by PSR Diversity</div>
  </div>
));

cartographer.register('upcomingRun', ({ index }) => {
  const [upcomingRuns] = cartographer.useReplicant('upcomingRuns', [], {
    namespace: 'psrd-2022-slush-rush-layouts',
  });

  const run = upcomingRuns[index];

  if (!run) return null;
  
  return (
    <div className="upcoming-run-container">
      <div className={`upcoming-run-time ${run.isNext ? 'is-next' : ''}`}>
        {run.isNext && 'Up next!'}
        {!run.isNext && (
          <div className="upcoming-run-time-duration">
            <div className="upcoming-run-time-label">In about</div>
            <div className="upcoming-run-time-value">{run.timeUntilRun}</div>
          </div>
        )}
      </div>
      <div className="upcoming-run-data">
        <div className="upcoming-run-name">{run.name}</div>
        <div className="upcoming-run-details">
          <div className="upcoming-run-category">{run.category}</div>
          <div className="upcoming-run-runners">by {run.runners.join(', ')}</div>
        </div>
      </div>                            
    </div>
  );
});

cartographer.register('nowPlaying', () => {
  const [nowPlaying] = cartographer.useReplicant('nowPlaying', '', {
    namespace: 'psrd-2022-slush-rush-layouts',
  });

  const nowPlayingValue = nowPlaying || 'Nothing';

  return (
    <div className="break-omnibar-side-item left">
      <div className="break-omnibar-side-item-label">Now Playing:</div>
      <div className="now-playing">
        <div>
          <span>{nowPlayingValue}</span>
        </div>
      </div>
    </div>
  );
});


cartographer.register('hostData', () => {
  const [hostData] = cartographer.useReplicant('hostData', { name: '', pronouns: '' }, {
    namespace: 'nodecg-speedrun-layout-options',
  });

  return (
    <div className="break-omnibar-side-item right">
      <div className="break-omnibar-side-item-label">Host:</div>
      <div className="break-host-data">
        {hostData.name} {hostData.pronouns ? `(${hostData.pronouns})` : ''}
      </div>
    </div>
  );
});

cartographer.register('donateCTA', () => (
  <div className="donate-cta">
    Donate now at<span>psrd.run/donate</span>!
  </div>
));