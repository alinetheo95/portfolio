import random
import numpy as np
import matplotlib.pyplot as plt

# Grid dimensions
GRID_SIZE = 100
# Define the initial aggregate point
center_x, center_y = GRID_SIZE // 2, GRID_SIZE // 2
aggregate = set([(center_x, center_y)])

# Number of steps for each random walker
N_STEPS = 1000
# Number of walkers to add
NUM_WALKERS = 500

# Visualization setup
grid = np.zeros((GRID_SIZE, GRID_SIZE))
grid[center_x, center_y] = 1 # Mark the initial point

for _ in range(NUM_WALKERS):
    # Spawn a new walker
    x, y = random.randint(0, GRID_SIZE - 1), random.randint(0, GRID_SIZE - 1)

    for _ in range(N_STEPS):
        # Perform a random walk step
        dx, dy = random.choice([(0, 1), (0, -1), (1, 0), (-1, 0)])
        x, y = x + dx, y + dy

        # Check boundaries
        if 0 <= x < GRID_SIZE and 0 <= y < GRID_SIZE:
            # Check if the walker has hit the aggregate
            for ax, ay in aggregate:
                if (x == ax and y == ay) or \
                   (x == ax + 1 and y == ay) or \
                   (x == ax - 1 and y == ay) or \
                   (x == ax and y == ay + 1) or \
                   (x == ax and y == ay - 1):
                    aggregate.add((x, y))
                    grid[x, y] = 1
                    break # Exit the inner loop if stuck
            else:
                continue
            break

# Display the result
plt.imshow(grid)
plt.show()