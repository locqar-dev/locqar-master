export var FREE_HOURS = 24;
export var OVERAGE_RATE = 2; // GH₵ per hour after 24hrs

export function calcOverage(hoursInLocker) {
  if (!hoursInLocker || hoursInLocker <= FREE_HOURS) return 0;
  return Math.ceil(hoursInLocker - FREE_HOURS) * OVERAGE_RATE;
}

export function lockerStatus(hoursInLocker) {
  if (!hoursInLocker) return 'active';
  if (hoursInLocker > FREE_HOURS) return 'overdue';
  if (hoursInLocker >= FREE_HOURS - 2) return 'warning';
  return 'active';
}

export function fmtHours(h) {
  var hrs = Math.floor(h);
  var mins = Math.round((h - hrs) * 60);
  return hrs + 'h' + (mins > 0 ? ' ' + mins + 'm' : '');
}
