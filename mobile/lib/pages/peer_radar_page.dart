import 'package:flutter/material.dart';

class PeerRadarPage extends StatefulWidget {
  const PeerRadarPage({super.key});

  @override
  State<PeerRadarPage> createState() => _PeerRadarPageState();
}

class _PeerRadarPageState extends State<PeerRadarPage> {
  final List<Map<String, dynamic>> _digests = [
    {
      "source": "Slack",
      "channel": "proj-compilers",
      "author": "Dr. Miller",
      "content": "The exam schedule has been updated. Compiler Project 3 submissions will close Friday afternoon instead of Thursday morning.",
      "time": "12m ago",
      "relevance": 94,
    },
    {
      "source": "Discord",
      "channel": "study-group-cs301",
      "author": "Alex",
      "content": "Let's meet up in the library basement at 4 PM to verify our AST registers layout. I've finished the parser code.",
      "time": "34m ago",
      "relevance": 68,
    },
    {
      "source": "Canvas",
      "channel": "CS229 Announcements",
      "author": "System",
      "content": "Homework 2 grades have been posted. Class average: 84.2%. Re-grade requests must be submitted within 7 days.",
      "time": "2h ago",
      "relevance": 42,
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
          "GROUP RADAR",
          style: TextStyle(
            fontFamily: 'Cabinet Grotesk',
            fontSize: 14,
            fontWeight: FontWeight.bold,
            letterSpacing: 1.5,
            color: Colors.white,
          ),
        ),
      ),
      body: SafeArea(
        child: Column(
          children: [
            // Top channels overview
            Container(
              height: 72,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              decoration: const BoxDecoration(
                border: Border(bottom: BorderSide(color: Color(0xFF1F1F1F))),
              ),
              child: Row(
                children: [
                  _buildSourceBadge("Slack", const Color(0xFF4A154B), true),
                  const SizedBox(width: 8),
                  _buildSourceBadge("Discord", const Color(0xFF5865F2), true),
                  const SizedBox(width: 8),
                  _buildSourceBadge("Canvas", const Color(0xFFE02229), true),
                  const SizedBox(width: 8),
                  _buildSourceBadge("WhatsApp", const Color(0xFF25D366), false),
                ],
              ),
            ),
            // Feed list
            Expanded(
              child: ListView.builder(
                physics: const BouncingScrollPhysics(),
                itemCount: _digests.length,
                padding: const EdgeInsets.all(16),
                itemBuilder: (context, index) {
                  final item = _digests[index];
                  final relevance = item['relevance'] as int;
                  final isHighRelevance = relevance >= 90;

                  return Dismissible(
                    key: Key(item['time']),
                    direction: DismissDirection.endToStart,
                    background: Container(
                      alignment: Alignment.centerRight,
                      padding: const EdgeInsets.symmetric(horizontal: 20),
                      color: const Color(0xFFFF4D4F),
                      child: const Icon(Icons.archive_outlined, color: Colors.white),
                    ),
                    onDismissed: (dir) {
                      setState(() {
                        _digests.removeAt(index);
                      });
                    },
                    child: Container(
                      margin: const EdgeInsets.only(bottom: 12),
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: const Color(0xFF121212),
                        borderRadius: BorderRadius.circular(4),
                        border: Border.all(color: const Color(0xFF2C2C2C)),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Row(
                                children: [
                                  Text(
                                    item['source'].toString().toUpperCase(),
                                    style: TextStyle(
                                      fontFamily: 'Inter',
                                      fontSize: 10,
                                      fontWeight: FontWeight.bold,
                                      color: _getSourceColor(item['source']),
                                      letterSpacing: 0.5,
                                    ),
                                  ),
                                  const SizedBox(width: 8),
                                  Text(
                                    "#${item['channel']}",
                                    style: const TextStyle(
                                      fontFamily: 'Inter',
                                      fontSize: 11,
                                      color: Color(0xFFA5A5A5),
                                    ),
                                  ),
                                ],
                              ),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                decoration: BoxDecoration(
                                  color: isHighRelevance
                                      ? const Color(0xFFFFD400)
                                      : const Color(0xFF2C2C2C),
                                  borderRadius: BorderRadius.circular(2),
                                ),
                                child: Text(
                                  "$relevance% MATCH",
                                  style: TextStyle(
                                    fontFamily: 'Inter',
                                    fontSize: 10,
                                    fontWeight: FontWeight.bold,
                                    color: isHighRelevance
                                        ? const Color(0xFF0A0A0A)
                                        : Colors.white,
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          Text(
                            item['content'],
                            style: const TextStyle(
                              fontFamily: 'Inter',
                              fontSize: 13,
                              color: Colors.white,
                              height: 1.4,
                            ),
                          ),
                          const SizedBox(height: 12),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                "From: ${item['author']}",
                                style: const TextStyle(
                                  fontFamily: 'Inter',
                                  fontSize: 11,
                                  color: Color(0xFFA5A5A5),
                                ),
                              ),
                              Text(
                                item['time'],
                                style: const TextStyle(
                                  fontFamily: 'Inter',
                                  fontSize: 11,
                                  color: Color(0xFFA5A5A5),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSourceBadge(String label, Color dotColor, bool active) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: const Color(0xFF121212),
        border: Border.all(color: const Color(0xFF2C2C2C)),
        borderRadius: BorderRadius.circular(4),
      ),
      child: Row(
        children: [
          Container(
            width: 6,
            height: 6,
            decoration: BoxDecoration(color: dotColor, shape: BoxShape.circle),
          ),
          const SizedBox(width: 6),
          Text(
            label,
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.bold,
              color: active ? Colors.white : const Color(0xFFA5A5A5),
            ),
          ),
        ],
      ),
    );
  }

  Color _getSourceColor(String source) {
    switch (source) {
      case 'Slack':
        return const Color(0xFF00D26A);
      case 'Discord':
        return const Color(0xFF5865F2);
      case 'Canvas':
        return const Color(0xFFFF4D4F);
      default:
        return Colors.white;
    }
  }
}
