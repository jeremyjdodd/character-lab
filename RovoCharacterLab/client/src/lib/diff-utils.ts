export interface DiffLine {
  type: "added" | "removed" | "unchanged";
  content: string;
}

export function computeDiff(textA: string, textB: string): DiffLine[] {
  // Simple line-based diff algorithm
  const linesA = textA.split('\n');
  const linesB = textB.split('\n');
  
  const diff: DiffLine[] = [];
  
  let i = 0; // pointer for textA lines
  let j = 0; // pointer for textB lines
  
  while (i < linesA.length || j < linesB.length) {
    if (i >= linesA.length) {
      // Remaining lines are additions
      diff.push({ type: "added", content: linesB[j] });
      j++;
    } else if (j >= linesB.length) {
      // Remaining lines are removals
      diff.push({ type: "removed", content: linesA[i] });
      i++;
    } else if (linesA[i] === linesB[j]) {
      // Lines match
      diff.push({ type: "unchanged", content: linesA[i] });
      i++;
      j++;
    } else {
      // Lines differ - look ahead to find potential matches
      let found = false;
      
      // Look for the current line from A in the next few lines of B
      for (let k = j + 1; k < Math.min(j + 5, linesB.length); k++) {
        if (linesA[i] === linesB[k]) {
          // Found match - add intermediate lines as additions
          while (j < k) {
            diff.push({ type: "added", content: linesB[j] });
            j++;
          }
          diff.push({ type: "unchanged", content: linesA[i] });
          i++;
          j++;
          found = true;
          break;
        }
      }
      
      if (!found) {
        // Look for the current line from B in the next few lines of A
        for (let k = i + 1; k < Math.min(i + 5, linesA.length); k++) {
          if (linesB[j] === linesA[k]) {
            // Found match - add intermediate lines as removals
            while (i < k) {
              diff.push({ type: "removed", content: linesA[i] });
              i++;
            }
            diff.push({ type: "unchanged", content: linesB[j] });
            i++;
            j++;
            found = true;
            break;
          }
        }
      }
      
      if (!found) {
        // No match found - treat as replacement
        diff.push({ type: "removed", content: linesA[i] });
        diff.push({ type: "added", content: linesB[j] });
        i++;
        j++;
      }
    }
  }
  
  return diff;
}

export function computeWordDiff(textA: string, textB: string): DiffLine[] {
  // Word-based diff for more granular comparison
  const wordsA = textA.split(/(\s+)/);
  const wordsB = textB.split(/(\s+)/);
  
  const diff: DiffLine[] = [];
  
  let i = 0;
  let j = 0;
  
  while (i < wordsA.length || j < wordsB.length) {
    if (i >= wordsA.length) {
      diff.push({ type: "added", content: wordsB[j] });
      j++;
    } else if (j >= wordsB.length) {
      diff.push({ type: "removed", content: wordsA[i] });
      i++;
    } else if (wordsA[i] === wordsB[j]) {
      diff.push({ type: "unchanged", content: wordsA[i] });
      i++;
      j++;
    } else {
      // Simple replacement for now
      diff.push({ type: "removed", content: wordsA[i] });
      diff.push({ type: "added", content: wordsB[j] });
      i++;
      j++;
    }
  }
  
  return diff;
}

export function highlightDifferences(text: string, differences: string[]): string {
  let highlightedText = text;
  
  differences.forEach(diff => {
    const regex = new RegExp(escapeRegex(diff), 'gi');
    highlightedText = highlightedText.replace(regex, `<mark class="bg-yellow-200 dark:bg-yellow-800">$&</mark>`);
  });
  
  return highlightedText;
}

function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
