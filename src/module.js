import React from 'react';

cartographer.register('run-info', ({ sidebar }) => {
  const [runDataActiveRun] = cartographer.useReplicant('runDataActiveRun', {}, {
    namespace: 'nodecg-speedcontrol',
  });

  return (
    <div className={`run-info-${sidebar ? 'sidebar' : 'center'}`}>
      <div className="info-block">
        <div className="info-block-backdrop" />
        {runDataActiveRun.game}
      </div>
      <div className="info-block run-details">
        <div className="category-name">{runDataActiveRun.category}</div>
        <div className="estimate">{runDataActiveRun.estimate}</div>
      </div>
    </div>
  );
});

cartographer.register('runner', ({ team = 0 }) => {
  const [runDataActiveRun] = cartographer.useReplicant('runDataActiveRun', null, {
    namespace: 'nodecg-speedcontrol',
  });

  if (!runDataActiveRun) return null;

  const runnerTeams = runDataActiveRun.teams.filter(team => (team.name || '').toLowerCase().indexOf('host') === -1);
  const runnerTeam = runnerTeams[team];

  if (!runnerTeam) return null;

  const runner = runnerTeam.players[0];

  return (
    <div className="runner commentator-info">
     <div className="commentator-name">{runner.name}</div>
     {runner.pronouns && <div className="pronouns">{runner.pronouns}</div>}
    </div>
  );
});

cartographer.register('commentators', () => {
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

  return (
    <div className="commentator-list">
      {commentatorData.map(([name, pronouns], index) => (
        <div key={index} className="commentator-info">
          <div className="commentator-name">{name}</div>
          {pronouns && <div className="pronouns">{pronouns}</div>}
        </div>
      ))}
    </div>
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