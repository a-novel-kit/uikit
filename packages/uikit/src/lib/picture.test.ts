import { centeredCrop, cropSize, imagePlacement, maxZoom, panCrop, pictureSize, zoomCrop } from "./picture";

import { describe, expect, it } from "vitest";

const square = { width: 1, height: 1 };
const wide = { width: 16, height: 9 };
const landscape = { url: "landscape.png", width: 1600, height: 900 };
const photo = { url: "photo.png", width: 1600, height: 1200 };
const portrait = { url: "portrait.png", width: 300, height: 400 };

const avatar = { ratio: square, maxWidth: 512, maxBytes: 262144 };
const background = { ratio: wide, maxWidth: 1280, maxBytes: 524288 };

describe("centeredCrop", () => {
  it.each([
    ["a landscape in a square", landscape, square, { zoom: 1, x: 350, y: 0 }],
    ["a portrait in a square", portrait, square, { zoom: 1, x: 0, y: 50 }],
    ["a 4:3 photo in a 16:9 frame", photo, wide, { zoom: 1, x: 0, y: 150 }],
    ["a panorama in a 16:9 frame", { url: "", width: 3200, height: 900 }, wide, { zoom: 1, x: 800, y: 0 }],
  ])("fits %s, centered", (_, source, ratio, crop) => {
    expect(centeredCrop(source, ratio)).toEqual(crop);
  });
});

describe("panCrop", () => {
  it("moves the image by a share of the frame's width on both axes", () => {
    const frame = { source: landscape, ratio: square, crop: centeredCrop(landscape, square) };
    expect(panCrop(frame, 0.1, 0)).toEqual({ zoom: 1, x: 260, y: 0 });
    expect(panCrop({ source: photo, ratio: wide, crop: { zoom: 2, x: 400, y: 300 } }, 0.1, 0.1)).toEqual({
      zoom: 2,
      x: 320,
      y: 220,
    });
  });

  it("keeps the image over the whole frame", () => {
    const frame = { source: landscape, ratio: square, crop: centeredCrop(landscape, square) };
    expect(panCrop(frame, 2, 0)).toEqual({ zoom: 1, x: 0, y: 0 });
    expect(panCrop(frame, -2, -1)).toEqual({ zoom: 1, x: 700, y: 0 });
    expect(panCrop({ ...frame, crop: { zoom: 2, x: 0, y: 0 } }, 0, -3)).toEqual({ zoom: 2, x: 0, y: 450 });
    expect(panCrop({ source: photo, ratio: wide, crop: { zoom: 2, x: 400, y: 300 } }, -3, -3)).toEqual({
      zoom: 2,
      x: 800,
      y: 750,
    });
  });
});

describe("zoomCrop", () => {
  it("keeps the center in place by default", () => {
    expect(zoomCrop({ source: landscape, ratio: square, crop: centeredCrop(landscape, square) }, 2)).toEqual({
      zoom: 2,
      x: 575,
      y: 225,
    });
    expect(zoomCrop({ source: photo, ratio: wide, crop: centeredCrop(photo, wide) }, 2)).toEqual({
      zoom: 2,
      x: 400,
      y: 375,
    });
  });

  it.each([
    ["a square", landscape, square],
    ["a 16:9 frame", photo, wide],
  ])("keeps the source pixel under the focus point in place in %s", (_, source, ratio) => {
    const before = centeredCrop(source, ratio);
    const size = cropSize(source, ratio, 1);
    const crop = zoomCrop({ source, ratio, crop: before }, 2, 0.25, 0.75);
    const next = cropSize(source, ratio, crop.zoom);
    expect({ x: crop.x + 0.25 * next.width, y: crop.y + 0.75 * next.height }).toEqual({
      x: before.x + 0.25 * size.width,
      y: before.y + 0.75 * size.height,
    });
  });

  it("stays between the fitted zoom and the closest one", () => {
    const frame = { source: photo, ratio: wide, crop: centeredCrop(photo, wide) };
    expect(zoomCrop(frame, 0.5).zoom).toBe(1);
    expect(zoomCrop(frame, 10).zoom).toBe(maxZoom);
  });

  it("pushes the frame back over the image when zooming out near an edge", () => {
    expect(zoomCrop({ source: landscape, ratio: square, crop: { zoom: 2, x: 1150, y: 450 } }, 1)).toEqual({
      zoom: 1,
      x: 700,
      y: 0,
    });
    expect(zoomCrop({ source: photo, ratio: wide, crop: { zoom: 2, x: 800, y: 750 } }, 1)).toEqual({
      zoom: 1,
      x: 0,
      y: 300,
    });
  });
});

describe("pictureSize", () => {
  it.each([
    ["the source pixels a crop keeps", { url: "", width: 400, height: 300 }, 1, [300, 300]],
    ["512 pixels at most", landscape, 1, [512, 512]],
    ["the closest zoom of a large source", landscape, 1.5, [512, 512]],
    ["a rounded side", { url: "", width: 1000, height: 1000 }, 3, [333, 333]],
    ["1 pixel at least", { url: "", width: 2, height: 2 }, maxZoom, [1, 1]],
  ])("saves a square of %s", (_, source, zoom, size) => {
    const { width, height } = pictureSize(source, { zoom, x: 0, y: 0 }, avatar);
    expect([width, height]).toEqual(size);
  });

  it.each([
    ["1280x720 at most", photo, 1, [1280, 720]],
    ["the source pixels a crop keeps", { url: "", width: 400, height: 300 }, 1, [400, 225]],
    ["a whole number of 16x9 units", { url: "", width: 100, height: 100 }, 1, [96, 54]],
    ["the closest units of a zoom", photo, 1.5, [1072, 603]],
    ["one 16x9 unit at least", { url: "", width: 10, height: 10 }, 1, [16, 9]],
  ])("saves a 16:9 background of %s", (_, source, zoom, size) => {
    const { width, height } = pictureSize(source, { zoom, x: 0, y: 0 }, background);
    expect([width, height]).toEqual(size);
  });

  it.each([1, 1.1, 1.37, 2.5, maxZoom])("keeps the ratio exactly at zoom %s", (zoom) => {
    for (const source of [landscape, photo, portrait]) {
      const { width, height } = pictureSize(source, { zoom, x: 0, y: 0 }, background);
      expect(width * wide.height).toBe(height * wide.width);
      expect(width).toBeLessThanOrEqual(background.maxWidth);
    }
  });

  it("reduces the ratio before sizing", () => {
    const doubled = { ...background, ratio: { width: 32, height: 18 } };
    expect(pictureSize(photo, { zoom: 1.5, x: 0, y: 0 }, doubled)).toEqual({ width: 1072, height: 603 });
  });
});

describe("imagePlacement", () => {
  it("scales and offsets the image so the crop fills the frame", () => {
    expect(imagePlacement({ source: landscape, ratio: square, crop: { zoom: 2, x: 450, y: 225 } })).toEqual({
      width: 355.55555555555554,
      left: -100,
      top: -50,
    });
    expect(imagePlacement({ source: photo, ratio: wide, crop: { zoom: 2, x: 400, y: 225 } })).toEqual({
      width: 200,
      left: -50,
      top: -50,
    });
  });
});
