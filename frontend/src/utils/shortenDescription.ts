export function shortenDescription(description: string, maxLength: number = 15) {
    if (description.length <= maxLength) {
        return description;
    }
    return description.substring(0, maxLength) + "...";
}
