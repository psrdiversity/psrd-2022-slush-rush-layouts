const dayjs = require('dayjs');
const chokidar = require('chokidar');
const fs = require('fs');

dayjs.extend(require('dayjs/plugin/relativeTime'));
dayjs.extend(require('dayjs/plugin/duration'));

const BUNDLE_NAME = 'psrd-2022-slush-rush-layouts';
const SPEEDCONTROl_BUNDLE_NAME = 'nodecg-speedcontrol';

const MAX_RUNS_IN_UPCOMING = 8;

const NOW_PLAYING_FILE = '/mnt/c/Users/archen/foobar-now-playing.txt';

module.exports = nodecg => {
  const runDataArray = nodecg.Replicant('runDataArray', SPEEDCONTROl_BUNDLE_NAME);
	const runDataActiveRun = nodecg.Replicant('runDataActiveRun', SPEEDCONTROl_BUNDLE_NAME);
  const upcomingRuns = nodecg.Replicant('upcomingRuns', BUNDLE_NAME, { defaultValue: [] });
  const nowPlaying = nodecg.Replicant('nowPlaying', BUNDLE_NAME, {
    defaultValue: fs.readFileSync(NOW_PLAYING_FILE).toString(),
    persistent: false
  });

  function updateUpcomingRuns() {
    const pendingRun = runDataActiveRun.value;

    const nextRunIndex = runDataArray.value.findIndex(run => run.id === pendingRun.id);
    
    let cumulativeRunTime = dayjs.duration(0);

    upcomingRuns.value = [...new Array(MAX_RUNS_IN_UPCOMING)].map((_, index) => {
      const upcomingRun = runDataArray.value[nextRunIndex + index];

      if (nextRunIndex !== -1 && upcomingRun) {
        const normalizedGameName = upcomingRun.game.length > 24 ? upcomingRun.game.replace(/Pok[eé]mon/, '').trim() : upcomingRun.game;

        const runnerTeams = upcomingRun.teams.filter(team => {
          const name = team.name?.toLowerCase() ?? '';
            
          return name.indexOf('host') === -1 && name.indexOf('commentary') === -1;
        });

        const runners = runnerTeams.reduce((acc, team) => [
          ...acc, 
          ...team.players.map(player => player.name),
        ], []);

        const durationSegments = upcomingRun.estimate?.split(':') ?? [];
        const setupTimeSegments = upcomingRun.setupTime?.split(':') ?? [];

        const duration = dayjs.duration({
          seconds: durationSegments[durationSegments.length - 1] ?? 0,
          minutes: durationSegments[durationSegments.length - 2] ?? 0,
          hours: durationSegments[durationSegments.length - 3] ?? 0,
        })

        const setupTime = dayjs.duration({
          seconds: setupTimeSegments[setupTimeSegments.length - 1] ?? 0,
          minutes: setupTimeSegments[setupTimeSegments.length - 2] ?? 0,
          hours: setupTimeSegments[setupTimeSegments.length - 3] ?? 0,
        })

        const isNext = cumulativeRunTime.asMilliseconds() === 0;

        cumulativeRunTime = cumulativeRunTime.add(setupTime);

        const timeUntilRun = cumulativeRunTime.humanize();

        cumulativeRunTime = cumulativeRunTime.add(duration);

        return {
          name: normalizedGameName,
          category: upcomingRun.category,
          runners,
          isNext,
          timeUntilRun,
        };
      }
    });
  }

  runDataArray.on('change', updateUpcomingRuns);
  runDataActiveRun.on('change', updateUpcomingRuns);

  updateUpcomingRuns();

  chokidar.watch(NOW_PLAYING_FILE).on('change', (_event, path) => {
    nowPlaying.value = fs.readFileSync(NOW_PLAYING_FILE).toString();
  });
};