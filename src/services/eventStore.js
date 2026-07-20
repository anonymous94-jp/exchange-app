const events = [];

/**
 * Lưu event
 */
export function addEvent(event) {

    events.push(event);

}

/**
 * Lấy toàn bộ event
 */
export function getEvents() {

    return events;

}

/**
 * Số lượng event
 */
export function size() {

    return events.length;

}

/**
 * Xóa toàn bộ
 */
export function clear() {

    events.length = 0;

}
