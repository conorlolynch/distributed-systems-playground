export function clearQueue(ctx, queueInstance) {
  ctx.clearRect(
    queueInstance.x,
    queueInstance.y,
    queueInstance.width,
    queueInstance.height
  );
}

export function drawQueueOutline(ctx, queueInstance) {
  ctx.strokeStyle = "white";
  ctx.lineWidth = 2;
  ctx.strokeRect(
    queueInstance.x,
    queueInstance.y,
    queueInstance.width,
    queueInstance.height
  );
}

export function drawQueueItems(ctx, queueInstance) {
  const queueInternalPadding = 10;
  const itemWidth = 30;
  const spaceBetweenItems = 10;

  const availableWidth =
    queueInstance.width - 2 * queueInternalPadding + spaceBetweenItems;

  const maxItemsThatCanBeDrawn = Math.floor(
    availableWidth / (itemWidth + spaceBetweenItems)
  );

  // If there are too many items, just draw the count of the queue and exit early
  if (queueInstance.size() > maxItemsThatCanBeDrawn) {
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText(
      `Items in Queue: ${queueInstance.size()}`,
      queueInstance.x + queueInternalPadding,
      queueInstance.y + queueInstance.height / 2
    );
    return;
  }

  function drawRequestItem(x, y, radius) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.stroke();
  }

  const startX = queueInstance.x + queueInternalPadding;
  const startY = queueInstance.y + queueInternalPadding;
  queueInstance.items.forEach((requestObject) => {
    drawRequestItem(
      startX +
        (itemWidth + spaceBetweenItems) *
          queueInstance.items.indexOf(requestObject) +
        itemWidth / 2,
      startY + itemWidth / 2,
      itemWidth / 2
    );
  });
}

export function drawQueue(ctx, queueInstance) {
  const queueInternalPadding = 10;

  // 2. Then try draw its contents
  // Can estimate if there are too many items based on dimensions of the queue.
  //  If so, just draw a number indicating how many items are in the queue
  const itemWidth = 30;
  const spaceBetweenItems = 10;

  const availableWidth =
    queueInstance.width - 2 * queueInternalPadding + spaceBetweenItems;

  const maxItemsThatCanBeDrawn = Math.floor(
    availableWidth / (itemWidth + spaceBetweenItems)
  );

  // If there are too many items, just draw the count of the queue and exit early
  if (queueInstance.size() > maxItemsThatCanBeDrawn) {
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText(
      `Items in Queue: ${queueInstance.size()}`,
      queueInstance.x + queueInternalPadding,
      queueInstance.y + queueInstance.height / 2
    );
    return;
  }

  function drawRequestItem(x, y, radius) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.stroke();
  }

  const startX = queueInstance.x + queueInternalPadding;
  const startY = queueInstance.y + queueInternalPadding;
  queueInstance.items.forEach((requestObject) => {
    drawRequestItem(
      startX +
        (itemWidth + spaceBetweenItems) *
          queueInstance.items.indexOf(requestObject) +
        itemWidth / 2,
      startY + itemWidth / 2,
      itemWidth / 2
    );
  });
}

export function drawWorkerPool(ctx) {
  // Figure out the dimensions of the worker pool based on number of workers
  const workerCount = Worker.workers.size;
}

export function drawWorker(ctx, worker) {
  const centerX = worker.x + worker.width / 2;
  const centerY = worker.y + worker.height / 2;
  const radius = Math.min(worker.width, worker.height) / 4;

  const startOfWorkerIdTextY = worker.y + worker.height + 20;
  const startOfWorkerLoadingBarY = startOfWorkerIdTextY + 10;

  // Draw the worker outline
  ctx.strokeStyle = "blue";
  ctx.lineWidth = 2;
  ctx.strokeRect(worker.x, worker.y, worker.width, worker.height);

  // Underneath the worker, draw its ID
  ctx.lineWidth = 1; // actually 1px now
  ctx.fillStyle = "white";
  ctx.font = "normal 16px system-ui";
  ctx.fillText(`ID: ${worker.id}`, worker.x + 5, startOfWorkerIdTextY);

  // If the worker is not idle, draw a request within the worker
  if (!worker.idle && worker.request) {
    // Drawing the request as a circle
    ctx.strokeStyle = "blue";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.stroke();

    // Draw a loading bar below the worker to indicate progress
    ctx.lineWidth = 1;
    ctx.strokeRect(worker.x, startOfWorkerLoadingBarY, worker.width, 10);

    const totalProcessingTime = worker.requestEndTime - worker.requestStartTime;
    const elapsedTime = performance.now() - worker.requestStartTime;
    const progress = Math.min(elapsedTime / totalProcessingTime, 1); // Clamp to [0, 1]

    ctx.fillStyle = "green";
    ctx.fillRect(
      worker.x,
      startOfWorkerLoadingBarY,
      worker.width * progress,
      10
    );

    return;
  }

  // If idle, remove any request drawing and remove loading bar
  const eraseRadius = radius + ctx.lineWidth / 2 + 1;
  // Punch out circle
  ctx.globalCompositeOperation = "destination-out";
  ctx.beginPath();
  ctx.arc(centerX, centerY, eraseRadius, 0, 2 * Math.PI);
  ctx.fill();

  // Reset mode (IMPORTANT)
  ctx.globalCompositeOperation = "source-over";
}
