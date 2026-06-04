import 'package:flutter/material.dart';

class DeadlinePage extends StatefulWidget {
  const DeadlinePage({super.key});

  @override
  State<DeadlinePage> createState() => _DeadlinePageState();
}

class _DeadlinePageState extends State<DeadlinePage> {
  bool _isTimelineView = true;
  int? _expandedCardIndex;

  final List<Map<String, dynamic>> _mockDeadlines = [
    {
      "title": "Compiler Project 3",
      "course": "CS301 Compilers",
      "due": "Today at 6:00 PM",
      "remaining_hours": 3.5,
      "urgency_score": 92,
      "risk_score": 78,
      "estimated_hours": 6.0,
      "buffer_hours": -2.5,
      "subtasks": [
        {"title": "Generate Intermediate Representation (IR)", "done": true},
        {"title": "Implement Register Allocator", "done": false},
        {"title": "Verify Code Generation tests", "done": false}
      ]
    },
    {
      "title": "Machine Learning Lab 4",
      "course": "CS229 Machine Learning",
      "due": "Tomorrow at 11:59 PM",
      "remaining_hours": 33.5,
      "urgency_score": 45,
      "risk_score": 12,
      "estimated_hours": 4.0,
      "buffer_hours": 12.0,
      "subtasks": [
        {"title": "Tune hyperparameters for CNN model", "done": true},
        {"title": "Plot training accuracy vs validation loss curves", "done": true},
        {"title": "Compile lab report PDF", "done": false}
      ]
    },
    {
      "title": "Database Midterm Review",
      "course": "CS145 Databases",
      "due": "June 10 at 2:00 PM",
      "remaining_hours": 168.0,
      "urgency_score": 12,
      "risk_score": 5,
      "estimated_hours": 3.0,
      "buffer_hours": 24.0,
      "subtasks": [
        {"title": "Review B+ Trees search algorithms", "done": false},
        {"title": "Practice Normalization & dependency parsing", "done": false}
      ]
    }
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0A0A0A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0A0A0A),
        elevation: 0,
        title: const Text(
          "DEADLINES",
          style: TextStyle(
            fontFamily: 'Cabinet Grotesk',
            fontSize: 14,
            fontWeight: FontWeight.bold,
            letterSpacing: 1.5,
            color: Colors.white,
          ),
        ),
        actions: [
          Row(
            children: [
              IconButton(
                icon: Icon(
                  Icons.timeline_outlined,
                  color: _isTimelineView ? const Color(0xFFFFD400) : const Color(0xFFA5A5A5),
                ),
                onPressed: () => setState(() => _isTimelineView = true),
              ),
              IconButton(
                icon: Icon(
                  Icons.view_list_outlined,
                  color: !_isTimelineView ? const Color(0xFFFFD400) : const Color(0xFFA5A5A5),
                ),
                onPressed: () => setState(() => _isTimelineView = false),
              ),
            ],
          )
        ],
      ),
      floatingActionButton: FloatingActionButton(
        backgroundColor: const Color(0xFFFFD400),
        foregroundColor: const Color(0xFF0A0A0A),
        shape: const CircleBorder(),
        onPressed: () {
          // Trigger scan dialog
          _showScanSelector();
        },
        child: const Icon(Icons.add),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: _isTimelineView ? _buildTimelineView() : _buildListView(),
        ),
      ),
    );
  }

  Widget _buildTimelineView() {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Vertical line representing timeline axis
        Container(
          width: 2,
          margin: const EdgeInsets.only(top: 16, bottom: 16, right: 16),
          color: const Color(0xFF2C2C2C),
          alignment: Alignment.topCenter,
        ),
        Expanded(
          child: ListView.builder(
            itemCount: _mockDeadlines.length,
            physics: const BouncingScrollPhysics(),
            padding: const EdgeInsets.symmetric(vertical: 16),
            itemBuilder: (context, index) {
              final item = _mockDeadlines[index];
              final isUrgent = item['remaining_hours'] < 6.0;
              final isExpanded = _expandedCardIndex == index;

              return Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Timeline custom indicator
                      Transform.translate(
                        offset: const Offset(-26, 24),
                        child: Container(
                          width: 10,
                          height: 10,
                          decoration: BoxDecoration(
                            color: isUrgent ? const Color(0xFFFFD400) : const Color(0xFF2C2C2C),
                            shape: BoxShape.circle,
                            border: Border.all(
                              color: isUrgent ? const Color(0xFFFFD400).withOpacity(0.5) : const Color(0xFF0A0A0A),
                              width: 2,
                            ),
                          ),
                        ),
                      ),
                      Expanded(
                        child: _buildDeadlineCard(item, index, isExpanded),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                ],
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildListView() {
    return ListView.builder(
      itemCount: _mockDeadlines.length,
      physics: const BouncingScrollPhysics(),
      padding: const EdgeInsets.symmetric(vertical: 16),
      itemBuilder: (context, index) {
        final item = _mockDeadlines[index];
        final isExpanded = _expandedCardIndex == index;
        return Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: _buildDeadlineCard(item, index, isExpanded),
        );
      },
    );
  }

  Widget _buildDeadlineCard(Map<String, dynamic> item, int index, bool isExpanded) {
    final double remaining = item['remaining_hours'];
    final bool isCritical = remaining < 6.0;
    final int risk = item['risk_score'];
    final int urgency = item['urgency_score'];

    return GestureDetector(
      onTap: () {
        setState(() {
          _expandedCardIndex = isExpanded ? null : index;
        });
      },
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 250),
        curve: Curves.easeInOut,
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: const Color(0xFF121212),
          borderRadius: BorderRadius.circular(4),
          border: Border.all(
            color: isCritical
                ? const Color(0xFFFF4D4F).withOpacity(0.5)
                : const Color(0xFF2C2C2C),
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      item['course'].toString().toUpperCase(),
                      style: const TextStyle(
                        fontFamily: 'Inter',
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFFA5A5A5),
                        letterSpacing: 1.0,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      item['title'],
                      style: const TextStyle(
                        fontFamily: 'Inter',
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                  ],
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: isCritical
                        ? const Color(0xFFFF4D4F).withOpacity(0.1)
                        : const Color(0xFF1C1C1C),
                    borderRadius: BorderRadius.circular(2),
                  ),
                  child: Text(
                    "Risk: $risk%",
                    style: TextStyle(
                      fontFamily: 'Inter',
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      color: isCritical ? const Color(0xFFFF4D4F) : const Color(0xFFA5A5A5),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Icon(
                      Icons.access_time,
                      size: 14,
                      color: isCritical ? const Color(0xFFFFD400) : const Color(0xFFA5A5A5),
                    ),
                    const SizedBox(width: 6),
                    Text(
                      item['due'],
                      style: TextStyle(
                        fontFamily: 'Inter',
                        fontSize: 12,
                        color: isCritical ? const Color(0xFFFFD400) : const Color(0xFFA5A5A5),
                      ),
                    ),
                  ],
                ),
                Text(
                  "Urgency: $urgency",
                  style: TextStyle(
                    fontFamily: 'Inter',
                    fontSize: 11,
                    color: isCritical ? const Color(0xFFFFD400) : const Color(0xFFA5A5A5),
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            if (isExpanded) ...[
              const SizedBox(height: 16),
              const Divider(color: Color(0xFF2C2C2C)),
              const SizedBox(height: 12),
              const Text(
                "DECOMPOSITION & TRACKING",
                style: TextStyle(
                  fontFamily: 'Inter',
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFFA5A5A5),
                  letterSpacing: 1.0,
                ),
              ),
              const SizedBox(height: 8),
              // List subtasks
              Column(
                children: List.generate((item['subtasks'] as List).length, (subIndex) {
                  final sub = item['subtasks'][subIndex];
                  return Padding(
                    padding: const EdgeInsets.symmetric(vertical: 4),
                    child: Row(
                      children: [
                        Icon(
                          sub['done'] ? Icons.check_circle : Icons.circle_outlined,
                          size: 16,
                          color: sub['done'] ? const Color(0xFF00D26A) : const Color(0xFF2C2C2C),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            sub['title'],
                            style: TextStyle(
                              fontFamily: 'Inter',
                              fontSize: 12,
                              color: sub['done'] ? const Color(0xFFA5A5A5) : Colors.white,
                              decoration: sub['done'] ? TextDecoration.lineThrough : null,
                            ),
                          ),
                        ),
                      ],
                    ),
                  );
                }),
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 10),
                      decoration: BoxDecoration(
                        color: const Color(0xFF0A0A0A),
                        borderRadius: BorderRadius.circular(2),
                        border: Border.all(color: const Color(0xFF2C2C2C)),
                      ),
                      child: Center(
                        child: Text(
                          "EST: ${item['estimated_hours']}H  |  BUFFER: ${item['buffer_hours']}H",
                          style: const TextStyle(
                            fontFamily: 'JetBrains Mono',
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }

  void _showScanSelector() {
    showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF121212),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(12)),
      ),
      builder: (context) {
        return Container(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                "CAPTURE ASSIGNMENT",
                style: TextStyle(
                  fontFamily: 'Cabinet Grotesk',
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                  letterSpacing: 1.0,
                ),
              ),
              const SizedBox(height: 16),
              ListTile(
                leading: const Icon(Icons.camera_alt_outlined, color: Colors.white),
                title: const Text("Scan Syllabus Photo", style: TextStyle(color: Colors.white, fontSize: 14)),
                subtitle: const Text("AI parses details from image", style: TextStyle(color: Colors.grey, fontSize: 12)),
                onTap: () {
                  Navigator.pop(context);
                },
              ),
              ListTile(
                leading: const Icon(Icons.sync_outlined, color: Colors.white),
                title: const Text("Sync Canvas LMS", style: TextStyle(color: Colors.white, fontSize: 14)),
                subtitle: const Text("Pull assignments dynamically", style: TextStyle(color: Colors.grey, fontSize: 12)),
                onTap: () {
                  Navigator.pop(context);
                },
              ),
            ],
          ),
        );
      },
    );
  }
}
