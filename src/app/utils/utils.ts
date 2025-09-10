export function getLocalStorageValue<T>(key:string):T|null {
    const item = localStorage.getItem(key)
    if (item) {
        return JSON.parse(item)
    }

    return null
}


export function setLocalStorageItem<T>(key: string, value: T) {
    localStorage.setItem(key,JSON.stringify(value))
}

export function removeLocalStorageItem(key:string) {
    localStorage.removeItem(key)
}

export function clearLocalStorage() {
    localStorage.clear()
}