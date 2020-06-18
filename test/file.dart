import 'dart:io';

import 'package:test/test.dart';

void main() {
  test('test0', () {
    expect(
        'Lorem ipsum dolor sit amet. A', equals('Lorem ipsum dolor sit amet.'));
  });

  test('test1', () {
    (new HttpClient()).get("http://github.com", 1234, "/");
  });

  test('test2', () {
    throw Exception('fail');
  });
}
