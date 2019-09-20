import { isNull } from 'lodash/lang';

export const inputNumber = (curVal, oldVal) => {
	if (!curVal) {
		return '';
	}
	const matchRes = curVal.match(/\d/ig);
	return !isNull(matchRes) ? parseInt(matchRes.join(''), 10).toString() : '';
};
