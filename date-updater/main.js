const piexif = require("piexifjs");
const fs = require("fs");
const path = require("path");

let filename1 = "C:\\Users\\kiewi\\Downloads\\20140615_201623891_iOS.jpg";
let filename2 = "C:\\Users\\kiewi\\Downloads\\20140615_201623891_iOS-copy.jpg";
const directoryName = "C:\\Users\\kiewi\\Downloads\\Year2014";
const exifKeys = [];

const files = fs.readdirSync(directoryName);
for (const fileName of files) {
    // Exif library does not support mp4
    if (['.mp4', '.mov'].includes(path.extname(fileName))) {
        continue;
    }

    readExif(path.join(directoryName, fileName), filename2);
}

/** File names are later, probably are in UTC time */
function parseFileName(fileName) {
    const matches = /\\(\d\d\d\d)(\d\d)(\d\d)_(\d\d)(\d\d)(\d\d)(\d\d\d)/.exec(fileName);

    const fileNameDate = new Date(Date.UTC(
        Number(matches[1]),
        Number(matches[2]) - 1,
        Number(matches[3]),
        Number(matches[4]),
        Number(matches[5]),
        Number(matches[6])));

    // convert to local date values
    return {
        year: fileNameDate.getFullYear(),
        month: fileNameDate.getMonth() + 1,
        day: fileNameDate.getDate(),
        hour: fileNameDate.getHours(),
        minute: fileNameDate.getMinutes(),
        second: fileNameDate.getSeconds(),
    };
}

/** EXIF dates are earlier, probably are in local time */
function parseExifDate(dateString) {
    if (!dateString) {
        return;
    }
    const matches = /^(\d\d\d\d):(\d\d):(\d\d)\s/.exec(dateString);
    return {
        year: Number(matches[1]),
        month: Number(matches[2]),
        day: Number(matches[3]),
    };
}

function pad(value) {
    if (value < 10) {
        return `0${value}`;
    }
    return `${value}`;
}

function fileNameDateToExifDate(dateParts) {
    console.log(`${dateParts.year}:${pad(dateParts.month)}:${pad(dateParts.day)} ${pad(dateParts.hour)}:${pad(dateParts.minute)}:${pad(dateParts.second)}`);
}

function readExif(filename1, filename2) {
    let jpeg = fs.readFileSync(filename1);
    let data = jpeg.toString("binary");

    // let zeroth = {};
    // let exif = {};
    // let gps = {};
    // zeroth[piexif.ImageIFD.Make] = "Make";
    // zeroth[piexif.ImageIFD.XResolution] = [777, 1];
    // zeroth[piexif.ImageIFD.YResolution] = [777, 1];
    // zeroth[piexif.ImageIFD.Software] = "Piexifjs";
    // exif[piexif.ExifIFD.DateTimeOriginal] = "2010:10:10 10:10:10";
    // exif[piexif.ExifIFD.LensMake] = "LensMake";
    // exif[piexif.ExifIFD.Sharpness] = 777;
    // exif[piexif.ExifIFD.LensSpecification] = [[1, 1], [1, 1], [1, 1], [1, 1]];
    // gps[piexif.GPSIFD.GPSVersionID] = [7, 7, 7, 7];
    // gps[piexif.GPSIFD.GPSDateStamp] = "1999:99:99 99:99:99";
    // let exifObj = { "0th": zeroth, "Exif": exif, "GPS": gps };

    let oldExif;
    try {
        oldExif = piexif.load(data);
    }
    catch (e) {
        console.log('Load error:', filename1);
        console.error(e);
    }

    const fileNameDate = parseFileName(filename1);
    const exifDate = oldExif && parseExifDate(oldExif['Exif'][piexif.ExifIFD.DateTimeOriginal]);
    if (exifDate == null ||
        fileNameDate.year !== exifDate.year ||
        fileNameDate.month !== exifDate.month ||
        fileNameDate.day !== exifDate.day) {
        console.log('Mismatch:', filename1);
        fileNameDateToExifDate(fileNameDate);
    }

    if (oldExif) {
        for (const key1 in oldExif) {
            const obj1 = oldExif[key1];
            if (typeof obj1 === 'object') {
                for (const key2 in obj1) {
                    const obj2 = obj1[key2];
                    if (typeof obj2 === 'string' && obj2.includes('201')) {
                        if (!exifKeys.includes(`${key1}-${key2}`)) {
                            // console.log('Key:', filename1);
                            console.log(key1, key2, obj2);
                            exifKeys.push(`${key1}-${key2}`);
                        }
                    }
                }
            }
        }
        oldExif['0th'][piexif.ImageIFD.DateTime] = "2010:10:10 10:10:10";
        oldExif['Exif'][piexif.ExifIFD.DateTimeOriginal] = "2010:10:10 10:10:10";
        oldExif['Exif'][piexif.ExifIFD.DateTimeDigitized] = "2010:10:10 10:10:10";
    }

    // let exifbytes = piexif.dump(oldExif);
    // let newData = piexif.insert(exifbytes, data);
    // let newJpeg = Buffer.from(newData, "binary");
    // fs.writeFileSync(filename2, newJpeg);    
}

