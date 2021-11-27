function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

function doPost(e) {
    const data = JSON.parse(e.postData.contents)
    const { zoneIdsAndCapacities, startDateTime, finishDateTime, duration, planId } = data
    const typeOfReport = Utilities.formatDate(new Date(duration * 1000), "GMT", "HH:mm:ss")
    const minutesNumber = duration / 60
    const numberOfRows = ((((new Date(finishDateTime)) - (new Date(startDateTime))) / 36000) * 36) / duration
    if (minutesNumber <= (((new Date(finishDateTime)) - (new Date(startDateTime))) / 60000)) {
        let stringAccumulator = ""
        for (let id in zoneIdsAndCapacities) {
            let dynamicTimeValue = new Date(startDateTime)
            for (let i = 1; i <= numberOfRows; i++) {
                let str = {}
                let minutesCounter = minutesNumber
                while (minutesCounter > 0) {
                    let randomP = getRandomInt(0, zoneIdsAndCapacities[id] + 1)
                    let randomM = getRandomInt(1, minutesCounter + 1)
                    minutesCounter = minutesCounter - randomM
                    str[randomP] = str[randomP] + randomM || randomM
                }
                let reducer = (accumulator, currentValue) => accumulator + currentValue
                let summa = Object.keys(str).map(Number).reduce(reducer)
                let positiveKeys = Object.keys(str).map(Number).filter(key => key > 0).length
                let frequency = positiveKeys / Object.keys(str).length
                if (!Number.isInteger(frequency)) {
                    frequency = parseFloat((frequency.toFixed(7) * 1).toString())
                }
                let occupancy = summa / (zoneIdsAndCapacities[id] * (Math.max(positiveKeys), 1))
                if (!Number.isInteger(occupancy)) {
                    occupancy = parseFloat((occupancy.toFixed(7) * 1).toString())
                }
                let capacityUsed = summa
                if (capacityUsed > zoneIdsAndCapacities[id]) {
                    capacityUsed = zoneIdsAndCapacities[id]
                }
                dynamicTimeValue.setMinutes(dynamicTimeValue.getMinutes() + minutesNumber)
                let formattedT = Utilities.formatDate(dynamicTimeValue, "GMT+3", "yyyy-MM-dd HH:mm:ss")
                let row = `('${id}','${formattedT}', '${duration}', '${JSON.stringify(str)}', '${typeOfReport}', '${frequency}', '${occupancy}', '${capacityUsed}', '${planId}'),\n`
                stringAccumulator += row
            }
            
        }
        let content = stringAccumulator.replace(/^[,\s]+|[,\s]+$/g, '')
        return ContentService.createTextOutput(content).setMimeType(ContentService.MimeType.TEXT)
    } else {
        return ContentService.createTextOutput('E: The duration can not be longer than time between startDateTime and finishDateTime').setMimeType(ContentService.MimeType.TEXT)
    }
}