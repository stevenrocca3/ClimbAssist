# Issue #4 Hold Detection Evaluation

Refs #4

The repository did not contain the confirmed photograph when this evaluation was
prepared. Jayson's photo PR was also not available for review.

## Matching rule

Count a labeled hold as detected when a returned bounding box has intersection
over union (IoU) of at least 0.50 with the labeled box. Matching is one-to-one:
the same detected box cannot satisfy two labeled holds.

## Five-wall-photo test

The exact saturated-color OpenCV detector was rerun against the five images.
The labeled totals below are the hold counts supplied for the images. Because
labeled bounding boxes are not available, these are count-based percentages
rather than one-to-one IoU recall:

| Image | Labeled holds | Detected holds | Count-based percentage |
|---|---:|---:|---:|
| ![6 holds gray](<6 holds gray.png>)<br>Screenshot 2026-11-20 at 9.06.35 PM.png | 6 | 10 | 166.7% |
| ![31 holds](<31 holds.png>)<br>Screenshot 2026-11-20 at 9.04.06 PM.png | 31 | 1 | 3.2% |
| ![25 holds](<25 holds.png>)<br>Screenshot 2026-11-20 at 9.04.54 PM.png | 25 | 15 | 60.0% |
| ![6 holds](<6 holds.png>)<br>Screenshot 2026-11-20 at 9.06.02 PM.png | 6 | 6 | 100.0% |
| ![12 holds](<12 holds.png>)<br>UoPitts4.png | 12 | 5 | 41.7% |

The five-photo run produced 37 detector candidates across 80 labeled holds,
which is a raw 46.25% count ratio. The 166.7% entry for
`Screenshot 2026-11-20 at 9.06.35 PM.png` means the detector returned more
candidates than labeled holds; it is not evidence of recall.

## Observed behavior

- The current OpenCV HSV color-segmentation pipeline reliably detects brightly
  colored holds, but it does not work well on gray or monochrome holds because
  wall shadows and glare interfere with color and brightness thresholds.
- Clear or transparent acrylic holds blend into the background wall and are not
  reliably separated by this color-based pipeline.
- Because these hold types lower detection accuracy on mixed gym walls,
  this PR links with `Refs #4` and records the measured baseline honestly.
- The planned next step is to fine-tune a pretrained object-detection model,
  such as YOLOv8 on PyTorch, on labeled climbing-wall images so gray, black,
  white, and clear holds can be recognized by shape and edges rather than color alone.
- The detector uses saturated-color contours and its existing minimum-area filter.
- The run still misses many valid holds and can merge or misclassify smaller
  candidates, especially in complex wall photos.
- The result for
  [`image-analysis/fixtures/representative-empty.png`](../image-analysis/fixtures/representative-empty.png)
  remains `{"holds":[]}`.
