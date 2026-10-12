import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  clusters,
  confidenceMeta,
  fitMeta,
  noveltyMeta,
  snapshot,
  stageMeta,
  statusMeta,
} from '../public/data/clusters.js';

test('research snapshot has 13 complete clusters', () => {
  assert.equal(clusters.length, 13);
  const range = Array.from({ length: 13 }, (_, index) => index + 1);
  assert.deepEqual(clusters.map((cluster) => cluster.rank).sort((a, b) => a - b), range);
  assert.deepEqual(clusters.map((cluster) => cluster.fitRank).sort((a, b) => a - b), range);
  assert.equal(new Set(clusters.map((cluster) => cluster.id)).size, 13);

  for (const cluster of clusters) {
    for (const field of ['title', 'shortTitle', 'category', 'whyNew', 'fitReason', 'signal', 'judgment', 'countercase', 'entry']) {
      assert.ok(cluster[field]?.trim(), `${cluster.id}.${field}`);
    }
    assert.ok(noveltyMeta[cluster.noveltyZone], cluster.id);
    assert.ok(fitMeta[cluster.fit], cluster.id);
    assert.ok(stageMeta[cluster.demandStage], cluster.id);
    assert.ok(statusMeta[cluster.institutionalStatus], cluster.id);
    assert.ok(confidenceMeta[cluster.confidence], cluster.id);
    assert.match(cluster.lastSignalAt, /^\d{4}-\d{2}-\d{2}$/);
    if (cluster.reviewedAt !== undefined) {
      assert.match(cluster.reviewedAt, /^\d{4}-\d{2}-\d{2}$/, cluster.id);
      assert.ok(
        snapshot.reports.some((report) => report.date === cluster.reviewedAt),
        `${cluster.id}: a report dated ${cluster.reviewedAt} must back the update`,
      );
    }
    assert.ok(cluster.facts.length >= 1, cluster.id);
    assert.ok(cluster.requiredKnowledge.length >= 4 && cluster.requiredKnowledge.length <= 5, cluster.id);
    assert.ok(cluster.keywords.length >= 1, cluster.id);
    assert.ok(cluster.sources.length >= 1, cluster.id);
    for (const source of cluster.sources) assert.match(source.url, /^https:\/\//);
  }
});

test('snapshot names the reports it comes from', () => {
  assert.ok(snapshot.updatedAt);
  assert.ok(snapshot.reports.length >= 1);
});
