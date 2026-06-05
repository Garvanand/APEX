import 'package:flutter/material.dart';
import '../core/theme.dart';

class ApexBottomNav extends StatelessWidget {
  final int currentIndex;
  final Function(int) onTabSelected;

  const ApexBottomNav({
    super.key,
    required this.currentIndex,
    required this.onTabSelected,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        border: Border(top: BorderSide(color: ApexTheme.borderGray, width: 1.0)),
      ),
      child: BottomNavigationBar(
        currentIndex: currentIndex,
        backgroundColor: ApexTheme.black,
        selectedItemColor: ApexTheme.iqooYellow,
        unselectedItemColor: ApexTheme.textMuted,
        selectedLabelStyle: const TextStyle(fontWeight: FontWeight.w800, fontSize: 10, letterSpacing: 2.0),
        unselectedLabelStyle: const TextStyle(fontWeight: FontWeight.w600, fontSize: 10, letterSpacing: 2.0),
        type: BottomNavigationBarType.fixed,
        elevation: 0,
        onTap: onTabSelected,
        items: const [
          BottomNavigationBarItem(
            icon: Padding(padding: EdgeInsets.only(bottom: 6), child: Icon(Icons.lens_blur, size: 22)),
            activeIcon: Padding(padding: EdgeInsets.only(bottom: 6), child: Icon(Icons.lens_blur, size: 24)),
            label: 'STATE',
          ),
          BottomNavigationBarItem(
            icon: Padding(padding: EdgeInsets.only(bottom: 6), child: Icon(Icons.adjust, size: 22)),
            activeIcon: Padding(padding: EdgeInsets.only(bottom: 6), child: Icon(Icons.adjust, size: 24)),
            label: 'DIRECTIVE',
          ),
          BottomNavigationBarItem(
            icon: Padding(padding: EdgeInsets.only(bottom: 6), child: Icon(Icons.all_inclusive, size: 22)),
            activeIcon: Padding(padding: EdgeInsets.only(bottom: 6), child: Icon(Icons.all_inclusive, size: 24)),
            label: 'INTELLIGENCE',
          ),
        ],
      ),
    );
  }
}
