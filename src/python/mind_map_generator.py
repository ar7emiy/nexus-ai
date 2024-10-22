import json
import matplotlib.pyplot as plt
import numpy as np
import textwrap

def truncate_text(text, max_words=6):
    words = text.split()
    if len(words) <= max_words:
        return text
    return ' '.join(words[:max_words]) + '...'

def generate_mind_map(data_file, output_file):
    with open(data_file, 'r') as f:
        data = json.load(f)

    fig, ax = plt.subplots(figsize=(24, 18))  # Larger figure size for better visibility
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)

    topic_centers = [(25, 50), (50, 25), (75, 50)]
    topic_colors = ['#E6E6FA', '#E6E6FA', '#E6E6FA']
    query_color = '#FFE4B5'

    query_positions = {}

    for i, topic in enumerate(data['topics']):
        x, y = topic_centers[i]
        circle = plt.Circle((x, y), 22, color=topic_colors[i], alpha=0.5)
        ax.add_artist(circle)
        # Increase font size of the topic names
        ax.text(x, y+25, textwrap.fill(topic['name'], 20), ha='center', va='center', fontweight='bold', fontsize=14)

        for j, query in enumerate(topic['queries']):
            angle = 2 * np.pi * j / len(topic['queries'])
            qx = x + 19 * np.cos(angle)
            qy = y + 19 * np.sin(angle)
            query_positions[query['id']] = (qx, qy)
            ax.add_patch(plt.Rectangle((qx-6, qy-3), 12, 6, fill=True, facecolor=query_color, edgecolor='black'))
            truncated_text = truncate_text(query['text'])
            # Increase font size of the questions
            ax.text(qx, qy, textwrap.fill(truncated_text, 20), ha='center', va='center', fontsize=10, wrap=True)

    for connection in data['connections']:
        start = query_positions[connection[0]]
        end = query_positions[connection[1]]
        ax.plot([start[0], end[0]], [start[1], end[1]], 'k-', linewidth=0.5)

    ax.axis('off')
    plt.tight_layout()
    plt.savefig(output_file, dpi=300, bbox_inches='tight')
    plt.close()

if __name__ == "__main__":
    generate_mind_map('C:/Users/yalov/nexus-ai/src/data/mind_map_data.json', 'C:/Users/yalov/nexus-ai/src/assets/mind_map.png')
