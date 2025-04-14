import poems from "../../data/poem.json";

export default function handler(req, res) {
  const { tags, wordCountLessThan } = req.query;

  let filteredPoems = poems;

  // Filter by tags (if provided)
  if (tags) {
    const tagArray = tags.split(",");
    filteredPoems = filteredPoems.filter((poem) => {
      if (!poem.Tags) return false;
      return tagArray.every((tag) => poem.Tags.includes(tag));
    });
  }

  // Filter by word count (if provided)
  if (wordCountLessThan) {
    const maxWordCount = parseInt(wordCountLessThan);
    if (!isNaN(maxWordCount)) {
      filteredPoems = filteredPoems.filter(
        (poem) => poem.WordCount < maxWordCount
      );
    }
  }

  if (filteredPoems.length === 0) {
    res.status(404).json({ message: "No poems found matching the criteria." });
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredPoems.length);
  const randomPoem = filteredPoems[randomIndex];

  res.status(200).json(randomPoem);
}
